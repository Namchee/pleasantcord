import {
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { performance } from 'perf_hooks';
import { ModuleThread, Pool, spawn, Worker } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';

import { ATTACHMENT_CONTENT_TYPE } from '../../constants/content';
import { BASE_CONFIG } from '../../entity/config';
import { Category, Content } from '../../entity/content';
import { Classifier } from '../../service/workers';
import { Logger } from '../../utils/logger';
import {
  CommandHandler,
  BotContext,
  CommandHandlerFunction,
  ClassificationResult,
} from '../types';
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

const workers = Pool(
  () => spawn<Classifier>(new Worker(`../../service/workers`)),
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
  msg: Message,
): Promise<void> {
  const channel = msg.channel as TextChannel;

  if (channel.nsfw) {
    return;
  }

  const contents: Content[] = [];
  msg.attachments.forEach(({ url, name, contentType }) => {
    if (!!contentType && ATTACHMENT_CONTENT_TYPE.includes(contentType)) {
      contents.push({
        type: contentType === 'image/gif' ? 'gif' : 'image',
        name: name || 'nsfw-attachment.jpg',
        url,
      });
    }
  });
  // for unexplained reason, `type` is deprecated although it isn't
  msg.embeds.forEach(({ type, url, image, video, thumbnail }) => {
    switch (type) {
      case 'image': {
        contents.push({
          type: 'image',
          name: 'nsfw-embed.jpg',
          url: url as string,
        });

        break;
      }
      case 'gifv': {
        contents.push({
          type: 'gif',
          name: 'nsfw-embed.gif',
          url: url as string,
        });

        break;
      }
      case 'rich': {
        if (image) {
          contents.push({
            type: 'image',
            name: 'nsfw-embed.jpg',
            url: image.url,
          });

          break;
        }

        if (video && thumbnail) {
          contents.push({
            type: 'image',
            name: 'nsfw-embed.jpg',
            url: thumbnail.url,
          });

          break;
        }
      }
    }
  });

  if (contents.length === 0) {
    return;
  }

  const isDev = process.env.NODE_ENV === 'development';
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
      new Error(`Failed to get configuration for server ${msg.guildId}}`),
    );
  }

  const tasks: QueuedTask<
    ModuleThread<Classifier>,
    ClassificationResult
  >[] = [];

  contents.forEach(({ name, url, type }) => {
    const classification = workers.queue(async (classifier) => {
      let start = 0;

      if (isDev) {
        start = performance.now();
      }

      const categories = type === 'gif' ?
        await classifier.classifyGIF(url) :
        await classifier.classifyImage(url);

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
    const isNSFW = categories.some((cat) => {
      return config.categories.includes(cat.name) &&
        cat.accuracy >= config.accuracy;
    });

    const promises = [];

    if (isNSFW) {
      // make sure that all queued tasks are killed
      tasks.forEach(t => t.cancel());

      const category = categories.find(
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
          {
            name: 'Contents',
            value: msg.content,
            inline: false,
          },
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
          '#FF9B05',
      });

      promises.push(channel.send({ embeds: [embed] }));

      const files = [];

      if (!config.delete) {
        files.push({
          attachment: source,
          name: `SPOILER_${name}`,
        });

        promises.push(
          channel.send({ files }),
        );
      }

      if (msg.deletable && !msg.deleted) {
        promises.push(
          msg.delete(),
        );
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
            value: categories.map(({ name, accuracy }) => {
              return `${name} — ${(accuracy * 100).toFixed(2)}%`;
            }).join('\n'),
          },
          {
            name: 'Elapsed Time',
            value: `${(time as number).toFixed(2)} ms`,
          },
        ],
        color: '#2674C2',
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

        return;
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
