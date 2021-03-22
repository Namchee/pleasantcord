import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import { isNSFW } from './../service/nsfw.classifier';
import { fetchImage } from './../service/image.downloader';
import { BotContext, CommandFunction, CommandHandler } from './../common/types';
import { moderateUser } from './../service/moderation';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

const commandMap = new Map<string, CommandFunction>();
const commands = readdirSync(resolve(__dirname, 'commands'));

commands.forEach((command: string) => {
  const file = require(
    resolve(__dirname, 'commands', command),
  );

  const handler = file.default as CommandHandler;

  console.log(handler.command);

  commandMap.set(handler.command, handler.fn);
});

export default {
  event: 'message',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    const { author, attachments, content } = msg;
    const prefix = config.commandPrefix;
    const channel = msg.channel as TextChannel;

    if (!msg.guild || author.bot) {
      return;
    }

    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/ +/);
      const commandHandler = commandMap.get(args[0]);

      if (commandHandler) {
        return commandHandler(ctx, msg);
      } else {
        return msg.reply('wtf');
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

          if (!config.deleteNSFW) {
            const blurredContent = channel.send(
              new MessageEmbed({
                author: {
                  name: config.name,
                  icon_url: config.imageUrl,
                },
                title: `Auto moderation message on #${channel.name}`,
                fields,
                description: '**⚠️ Potentially NSFW ⚠️**',
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
            await moderateUser(ctx, channel, member);
          }

          return;
        }
      }
    }
  },
};
