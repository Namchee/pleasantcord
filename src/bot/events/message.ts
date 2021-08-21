import {
  Guild,
  GuildMember,
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js';

import { NSFWClassifier } from '../../service/nsfw.classifier';
import { fetchImage } from '../../service/image.downloader';
import { CommandHandler, BotContext } from '../types';
import { handleError, getCommands } from '../utils';

const commandMap: Record<string, Function> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

export default {
  event: 'message',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    const { author, attachments, content } = msg;
    const prefix = 'pc!';

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
        const unknownEmbed = new MessageEmbed({
          author: {
            name: 'pleasantcord',
            iconURL: process.env.IMAGE_URL,
          },
          color: '#E53E3E',
          title: 'Unknown Command',
          description:
            // eslint-disable-next-line max-len
            `**pleasantcord** doesn't recognize the command that have been just sent.\nPlease refer to **${prefix}help** to show all available **${ctx.config.name}'s** commands.`,
        });

        return channel.send({ embeds: [unknownEmbed] });
      }
    }

    const hasImage = attachments.some(
      ({ url }) => /\.(jpg|png|jpeg)$/.test(url),
    );

    if (channel.nsfw || !hasImage) {
      return;
    }

    try {
      const classifier = await NSFWClassifier.getInstance();

      const moderations = attachments.map(
        async ({ url, name }: MessageAttachment) => {
          if (/\.(jpg|png|jpeg)$/.test(url)) {
            const image = await fetchImage(url);
            const { isSFW, category } = await classifier.classifyImage(image);

            if (!isSFW) {
              const fields = [
                {
                  name: 'Original Author',
                  value: author.toString(),
                },
                {
                  name: 'Reason',
                  value: 'Potentially NSFW attachment',
                },
                {
                  name: 'Category',
                  value: category.name,
                  inline: true,
                },
                {
                  name: 'Accuracy',
                  value: `${(category.confidence * 100).toFixed(2)}%`,
                  inline: true,
                },
              ];

              if (content) {
                fields.push(
                  { name: 'Original Content', value: content, inline: false },
                );
              }

              const req = [];

              /*
              if (!deleteNSFW) {
                const blurredMessage = channel.send(
                  new MessageEmbed({
                    author: {
                      name: botName,
                      iconURL: botImage,
                    },
                    title: 'Possible NSFW Contents Detected',
                    fields,
                    color: '#E53E3E',
                    files: [
                      {
                        attachment: image,
                        name: `SPOILER_${name}`,
                      },
                    ],
                  }),
                );

                req.push(blurredMessage);
              }
              */

              if (msg.deletable) {
                req.push(
                  msg.delete({
                    reason: 'Possible NSFW content',
                  }),
                );
              }

              await Promise.all(req);

              const member = msg.guild?.member(author);

              if (member) {
                await moderateMember(ctx, msg, member);
              }
            }
          }
        },
      );

      await Promise.all(moderations);
    } catch (err) {
      const modChannel = resolveModerationChannel(
        msg.guild as Guild,
        ctx.config,
      );

      const error = handleError(ctx.config, err);

      if (modChannel) {
        modChannel.send(error);
        return;
      }

      return msg.reply(error);
    }
  },
};
