import { Message, MessageEmbed, TextChannel } from 'discord.js';

import { isNSFW } from '../../service/nsfw.classifier';
import { fetchImage } from '../../service/image.downloader';
import { moderateUser } from '../../service/moderation';
import { CommandHandler, BotContext } from '../types';
import { getCommands } from '../utils';


const commandMap: Record<string, Function> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

export default {
  event: 'message',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    const { author, attachments, content } = msg;
    const { prefix, deleteNSFW, name, imageUrl } = ctx.config;

    if (!msg.guild || !msg.channel.isText() || author.bot) {
      return;
    }

    const channel = msg.channel as TextChannel;

    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/ +/);
      const commandHandler = commandMap[args[0]];

      if (commandHandler) {
        return commandHandler(ctx, msg);
      } else {
        return channel.send(
          // eslint-disable-next-line max-len
          `Whoops, I don't recognize that command. Try **${prefix}help**`,
        );
      }
    }

    if (channel.nsfw) {
      return;
    }

    for (const attachment of attachments) {
      const { url } = attachment[1];

      if (/\.(jpg|png|jpeg)$/.test(url)) {
        const verdict = await isNSFW(url);

        if (!verdict.isSFW) {
          const image = await fetchImage(attachment[1].url);
          const confidence = verdict.confidence as number;

          const fields = [
            {
              name: 'Original Author',
              value: author.toString(),
              inline: true,
            },
            {
              name: 'Reason',
              value: 'Potentially NSFW attachment',
              inline: true,
            },
            {
              name: 'Accuracy',
              value: `${(confidence * 100).toFixed(2)}%`,
              inline: true,
            },
          ];

          if (content) {
            fields.push(
              { name: 'Original Content', value: content, inline: false },
            );
          }

          const messages = [];

          if (!deleteNSFW) {
            const blurredContent = channel.send(
              new MessageEmbed({
                author: {
                  name: name,
                  iconURL: imageUrl,
                },
                title: `NSFW Moderation on #${channel.name}`,
                fields,
                color: '#E53E3E',
                files: [
                  {
                    attachment: image,
                    name: `SPOILER_${attachment[1].name}`,
                  },
                ],
              }),
            );

            messages.push(blurredContent);
          }

          const del = msg.delete({
            reason: 'Possible NSFW content',
          });

          messages.push(del);

          await Promise.allSettled(messages);

          const member = msg.guild.member(author);

          if (member) {
            await moderateUser(ctx, msg, member);
          }

          return;
        }
      }
    }
  },
};
