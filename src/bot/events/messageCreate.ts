import {
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';

import {
  EMBED_CONTENT_TYPE,
  ATTACHMENT_CONTENT_TYPE,
} from '../../constants/content';
import { Category, Content } from '../../entity/content';
import { fetchContent } from '../../utils/content.downloader';
import { CommandHandler, BotContext, CommandHandlerFunction } from '../types';
import { handleError, getCommands } from '../utils';

/**
 * Get all available commands from command files and
 * register all commands to a simple object map.
 */
const commandMap: Record<string, CommandHandlerFunction> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

/**
 * Check all supported content for NSFW contents
 * and react accordingly.
 *
 * @param {BotContext} ctx bot context
 * @param {Message} msg discord's message object
 * @returns {Promise<void>}
 */
async function moderateContent(
  { classifier, configRepository }: BotContext,
  msg: Message,
): Promise<void> {
  const channel = msg.channel as TextChannel;

  if (channel.nsfw) {
    return;
  }

  const config = await configRepository.getConfig(msg.guildId as string);

  if (!config) {
    throw new Error(
      // eslint-disable-next-line max-len
      `Data synchronization failure: Configuration doesn't exists for ${msg.guild?.name}`,
    );
  }

  const contents: Content[] = [];
  msg.attachments.forEach(({ url, name, contentType }) => {
    if (!!contentType && ATTACHMENT_CONTENT_TYPE.includes(contentType)) {
      contents.push({
        type: contentType === 'image/gif' ? 'gif' : 'image',
        name: name || 'nsfw-attachment',
        url,
      });
    }
  });
  // for unexplained reason, `type` is deprecated although it isn't
  msg.embeds.forEach(({ type, url }) => {
    if (url && EMBED_CONTENT_TYPE.includes(type)) {
      contents.push({
        type: type === 'gifv' ? 'gif' : 'image',
        name: 'nsfw-embed',
        url,
      });
    }
  });

  const moderations: Promise<Message[] | Message>[] = contents.map(
    async ({ type, name, url }: Content) => {
      const request = [];

      let start = 0;
      if (process.env.NODE_ENV === 'development') {
        start = performance.now();
      }

      const content = await fetchContent(url);
      const classification = type === 'gif' ?
        await classifier.classifyGif(content) :
        await classifier.classifyImage(content);

      const isNSFW = classification.some((cat) => {
        return config.categories.includes(cat.name) &&
          cat.accuracy >= config.threshold;
      });

      if (isNSFW) {
        const category = classification.find(
          cat => config.categories.includes(cat.name),
        ) as Category;

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
            value: `${(category.accuracy * 100).toFixed(2)}%`,
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
          color: process.env.NODE_ENV === 'development' ?
            '#2674C2' :
            '#FFA31A',
        });

        const files = [];

        if (!config.delete) {
          files.push({
            attachment: content,
            name: `SPOILER_${name}`,
          });
        }

        request.push(
          channel.send({ embeds: [embed], files }),
        );

        if (msg.deletable && !msg.deleted) {
          request.push(msg.delete());
        }
      }

      if (process.env.NODE_ENV === 'development') {
        const devEmbed = new MessageEmbed({
          author: {
            name: 'pleasantcord',
            iconURL: process.env.IMAGE_URL,
          },
          title: '[DEV] Image Labels',
          fields: [
            {
              name: 'Labels',
              value: classification.map(({ name, accuracy }) => {
                return `${name} — ${(accuracy * 100).toFixed(2)}%`;
              }).join('\n'),
            },
            {
              name: 'Elapsed Time',
              value: `${(performance.now() - start).toFixed(2)} ms`,
            },
          ],
          color: '#2674C2',
        });

        request.push(channel.send({ embeds: [devEmbed] }));
      }

      return Promise.all(request);
    });

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

      await moderateContent(ctx, msg);
    } catch (err) {
      const errorEmbed = handleError(err as Error);

      if (errorEmbed) {
        msg.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};
