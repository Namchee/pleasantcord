import { performance } from 'perf_hooks';

import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Pool, spawn, Worker, FunctionThread } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';

import { Classifier } from '../../service/workers';

import { BASE_CONFIG } from '../../entity/config';
import { Category, Content } from '../../entity/content';

import { BLUE, ORANGE, RED } from '../../constants/color';
import { PREFIX } from '../../constants/command';

import {
  handleError,
  getCommands,
  getCommand,
  getSupportedContents,
} from '../utils';
import { Logger } from '../../utils/logger';

import {
  CommandHandler,
  BotContext,
  CommandHandlerFunction,
  ClassificationResult,
} from '../types';

/**
 * Get all available commands from command files and
 * register all commands to a simple object map.
 */
const commandMap: Record<string, CommandHandlerFunction> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

const workers = Pool(() =>
  spawn<Classifier>(new Worker(`../../service/workers`))
);

/**
 * Check all supported content for NSFW contents
 * and react accordingly.
 *
 * @param {BotContext} ctx bot context
 * @param {Message} msg discord's message object
 * @returns {Promise<void>}
 */
async function moderateContent(
  { service, rateLimiter }: BotContext,
  msg: Message
): Promise<void> {
  const channel = msg.channel as TextChannel;

  if (channel.nsfw) {
    return;
  }

  const contents: Content[] = getSupportedContents(msg);

  if (contents.length === 0) {
    return;
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const rateLimitKey = `${msg.guildId as string}:${msg.channelId}`;

  if (rateLimiter.isRateLimited(rateLimitKey) && !isDev) {
    return;
  }

  rateLimiter.rateLimit(rateLimitKey);

  let config = BASE_CONFIG;

  const realConfig = await service.getConfig(msg.guildId as string);

  if (realConfig) {
    config = realConfig;
  } else {
    Logger.getInstance().logBot(
      new Error(`Failed to get configuration for server ${msg.guildId}}`)
    );
  }

  const tasks: QueuedTask<FunctionThread, ClassificationResult>[] = [];

  contents.forEach(({ name, url }) => {
    const classification = workers.queue(async classifier => {
      let start = 0;

      if (isDev) {
        start = performance.now();
      }

      const categories = await classifier(url);

      return {
        name,
        source: url,
        categories,
        time: isDev ? performance.now() - start : undefined,
      };
    });

    tasks.push(classification);
  });

  for await (const { name, source, categories, time } of tasks) {
    if (!categories.length) {
      continue;
    }

    const isNSFW = categories.some(cat => {
      return (
        config.categories.includes(cat.name) && cat.accuracy >= config.accuracy
      );
    });

    const promises = [];

    if (isNSFW) {
      // make sure that all queued tasks are killed
      tasks.forEach(t => t.cancel());

      const category = categories.find(cat =>
        config.categories.includes(cat.name)
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
        fields.push({
          name: 'Contents',
          value: msg.content,
          inline: false,
        });
      }

      const embed = new MessageEmbed({
        author: {
          name: 'pleasantcord',
          iconURL: process.env.IMAGE_URL,
        },
        title: 'Possible NSFW Contents Detected',
        fields,
        color: process.env.NODE_ENV !== 'production' ? BLUE : ORANGE,
      });

      promises.push(channel.send({ embeds: [embed] }));

      const files = [];

      if (!config.delete) {
        files.push({
          attachment: source,
          name: `SPOILER_${name}`,
        });

        promises.push(channel.send({ files }));
      }

      if (msg.deletable && !msg.deleted) {
        promises.push(msg.delete());
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const devEmbed = new MessageEmbed({
        author: {
          name: 'pleasantcord',
          iconURL: process.env.IMAGE_URL,
        },
        title: '[DEV] Image Labels',
        fields: [
          {
            name: 'Labels',
            value: categories
              .map(({ name, accuracy }) => {
                return `${name} — ${(accuracy * 100).toFixed(2)}%`;
              })
              .join('\n'),
          },
          {
            name: 'Elapsed Time',
            value: `${(time as number).toFixed(2)} ms`,
          },
        ],
        color: BLUE,
      });

      promises.push(channel.send({ embeds: [devEmbed] }));
    }

    await Promise.all(promises);

    if (isNSFW) {
      break;
    }
  }
}

export default {
  event: 'messageCreate',
  fn: async (
    ctx: BotContext,
    msg: Message
  ): Promise<Message<boolean> | void> => {
    try {
      if (!msg.guild || !msg.channel.isText() || msg.author.bot) {
        return;
      }

      if (msg.content.startsWith(PREFIX)) {
        const commandHandler = commandMap[getCommand(msg.content)];

        if (commandHandler) {
          return commandHandler(ctx, msg);
        }

        const unknownEmbed = new MessageEmbed({
          author: {
            name: 'pleasantcord',
            iconURL: process.env.IMAGE_URL,
          },
          color: RED,
          title: 'Unknown Command',
          description:
            // eslint-disable-next-line max-len
            `**pleasantcord** doesn't recognize the command that have been just sent.\nPlease refer to **${PREFIX}help** to show all available **pleasantcords's** commands.`,
        });

        return msg.channel.send({ embeds: [unknownEmbed] });
      }

      return moderateContent(ctx, msg);
    } catch (err) {
      const errorEmbed = handleError(err as Error);

      if (errorEmbed) {
        return msg.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};
