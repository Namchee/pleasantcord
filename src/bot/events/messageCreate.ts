import {
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js';

import { fetchImage } from '../../utils/image.downloader';
import { ImageCategory } from '../../utils/nsfw.classifier';
import { CommandHandler, BotContext, CommandHandlerFunction } from '../types';
import { handleError, getCommands } from '../utils';

const commandMap: Record<string, CommandHandlerFunction> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

async function testContent(
  { classifier, configRepository }: BotContext,
  msg: Message,
): Promise<void> {
  const channel = msg.channel as TextChannel;
  const config = await configRepository.getConfig(msg.guildId as string);

  if (!config) {
    throw new Error(
      // eslint-disable-next-line max-len
      `Data synchronization failure: Configuration doesn't exists for ${msg.guild?.name}`,
    );
  }

  const hasImage = msg.attachments.some(
    ({ url }) => /\.(jpg|png|jpeg)$/.test(url),
  );

  if (channel.nsfw || !hasImage) {
    return;
  }

  const moderations = msg.attachments.map(
    async ({ url, name }: MessageAttachment) => {
      if (/\.(jpg|png|jpeg)$/.test(url)) {
        const image = await fetchImage(url);
        const classification = await classifier.classifyImage(image);
        const isNSFW = classification.some((cat) => {
          return config.categories.includes(cat.name) &&
            cat.probability >= config.threshold;
        });

        if (isNSFW) {
          const category = classification.find(
            cat => config.categories.includes(cat.name),
          ) as ImageCategory;
          const fields = [
            {
              name: 'Author',
              value: msg.author.toString(),
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
              { name: 'Contents', value: msg.content, inline: false },
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

          if (!config.delete) {
            files.push({
              attachment: image,
              name: `SPOILER_${name}`,
            });
          }

          const request = [
            channel.send({ embeds: [embed], files }),
            msg.delete(),
          ];

          if (process.env.NODE_ENV === 'development') {
            const devEmbed = new MessageEmbed({
              author: {
                name: 'pleasantcord',
                iconURL: process.env.IMAGE_URL,
              },
              title: '[DEV] Image Labels',
              description: classification.map(({ name, probability }) => {
                return `**${name}** — ${(probability * 100).toFixed(2)}%`;
              }).join('\n'),
              color: '#2674C2',
            });

            request.push(channel.send({ embeds: [devEmbed] }));
          }

          return request;
        }
      }
    },
  );

  await Promise.all(moderations);
}

export default {
  event: 'messageCreate',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    try {
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
    } catch (err) {
      const errorEmbed = handleError(err as Error);
      msg.channel.send({ embeds: [errorEmbed] });
    }
  },
};
