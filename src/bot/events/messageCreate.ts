import {
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js';

import { fetchImage } from '../../utils/image.downloader';
import { CommandHandler, BotContext, CommandHandlerFunction } from '../types';
import { handleError, getCommands } from '../utils';

const commandMap: Record<string, CommandHandlerFunction> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

async function testContent(
  { classifier }: BotContext,
  msg: Message,
): Promise<void> {
  const channel = msg.channel as TextChannel;
  const deleteNSFW = false;

  const hasImage = msg.attachments.some(
    ({ url }) => /\.(jpg|png|jpeg)$/.test(url),
  );

  if (channel.nsfw || !hasImage) {
    return;
  }

  try {
    const moderations = msg.attachments.map(
      async ({ url, name }: MessageAttachment) => {
        if (/\.(jpg|png|jpeg)$/.test(url)) {
          const image = await fetchImage(url);
          const { isSFW, category } = await classifier.classifyImage(
            image,
            0.7,
          );

          if (!isSFW) {
            const fields = [
              {
                name: 'Original Author',
                value: msg.author.toString(),
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
                value: `${(category.probability * 100).toFixed(2)}%`,
                inline: true,
              },
            ];

            if (msg.content) {
              fields.push(
                { name: 'Original Content', value: msg.content, inline: false },
              );
            }

            const embed = new MessageEmbed({
              author: {
                name: 'pleasantcord',
                iconURL: process.env.IMAGE_URL,
              },
              title: 'Possible NSFW Contents Detected',
              fields,
              color: '#E53E3E',
            });

            const files = [];

            if (!deleteNSFW) {
              files.push({
                attachment: image,
                name: `SPOILER_${name}`,
              });
            }

            return [
              channel.send({ embeds: [embed], files }),
              msg.delete(),
            ];
          }
        }
      },
    );

    await Promise.all(moderations);
  } catch (err) {
    const errorEmbed = handleError(err as Error);
    channel.send({ embeds: [errorEmbed] });
  }
}

export default {
  event: 'messageCreate',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    const prefix = 'pc!';

    if (!msg.guild || !msg.channel.isText() || msg.author.bot) {
      return;
    }

    if (msg.content.startsWith(prefix)) {
      const args = msg.content.slice(prefix.length).trim().split(/ +/);
      const commandHandler = commandMap[args[0]];

      if (commandHandler) {
        await commandHandler(ctx, msg);
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
            `**pleasantcord** doesn't recognize the command that have been just sent.\nPlease refer to **${prefix}help** to show all available **pleasantcords's** commands.`,
        });

        await msg.channel.send({ embeds: [unknownEmbed] });
      }
    }

    await testContent(ctx, msg);
  },
};
