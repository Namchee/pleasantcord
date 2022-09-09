import { Message, TextChannel, EmbedBuilder } from 'discord.js';

import { FunctionThread, Pool, spawn, Worker } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';

import { Classifier } from './../../service/workers';

import {
  BASE_CONFIG,
  Configuration,
  getContentTypeFromConfig,
} from './../../entity/config';
import { Category, Content } from './../../entity/content';

import { BLUE, ORANGE } from './../../constants/color';

import { BotContext, ClassificationResult } from '../types';

import { getFilterableContents } from '../utils';

export const workers = Pool(() =>
  spawn<Classifier>(new Worker('../../service/workers'))
);

/**
 * Classify contents from a user message
 *
 * @param {Message} msg user message
 * @param {Configuration} config server configuration
 * @param {boolean} time determines if elapsed time should be logged or not
 * @returns {QueuedTask<FunctionThread, ClassificationResult>[]} classification tasks
 */
export function classifyContent(
  msg: Message,
  config: Configuration,
  time = false
): QueuedTask<FunctionThread, ClassificationResult>[] {
  const contents: Content[] = getFilterableContents(
    msg,
    config.contents.includes('Sticker')
  );
  if (contents.length === 0) {
    return [];
  }

  const classifiableContent = getContentTypeFromConfig(config);

  const tasks: QueuedTask<FunctionThread, ClassificationResult>[] = [];

  contents.forEach(({ name, url }) => {
    const classification = workers.queue(async classifier => {
      let start = 0;

      if (time) {
        start = performance.now();
      }

      const categories = await classifier(
        url,
        config.model,
        classifiableContent
      );

      return {
        name,
        source: url,
        categories,
        time: time ? performance.now() - start : undefined,
      };
    });

    tasks.push(classification);
  });

  return tasks;
}

/**
 * Check all supported content for NSFW contents
 * and react accordingly.
 *
 * @param {BotContext} ctx bot context
 * @param {Message} msg discord's message object
 * @returns {Promise<void>}
 */
export async function moderateContent(
  { service, rateLimiter }: BotContext,
  msg: Message
): Promise<void> {
  const channel = msg.channel as TextChannel;

  if (channel.nsfw) {
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
  }

  const results = classifyContent(msg, config, isDev);

  for await (const { name, source, categories, time } of results) {
    if (!categories.length) {
      continue;
    }

    const nsfwCategory = categories.find(cat => {
      return (
        config.categories.includes(cat.name) && cat.accuracy >= config.accuracy
      );
    });

    const promises = [];

    if (nsfwCategory) {
      results.forEach(result => result.cancel());

      const fields = [
        {
          name: 'Author',
          value: msg.author.toString(),
        },
        {
          name: 'Category',
          value: nsfwCategory.name,
          inline: true,
        },
        {
          name: 'Accuracy',
          value: `${(nsfwCategory.accuracy * 100).toFixed(2)}%`,
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

      const embed = new EmbedBuilder({
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

      if (msg.deletable) {
        promises.push(msg.delete());
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const resultLog = generateClassificationResultLog(
        categories,
        config,
        time || 0
      );

      promises.push(channel.send({ embeds: [resultLog] }));
    }

    await Promise.all(promises);

    if (nsfwCategory) {
      break;
    }
  }
}

/**
 * Generate classification result log in form of `EmbedBuilder`
 *
 * @param {Category[]} categories content categories
 * @param {Configuration} config configuration object
 * @param {number} time time needed to classify contents.
 * @returns {EmbedBuilder} classification result log
 */
export function generateClassificationResultLog(
  categories: Category[],
  config: Configuration,
  time: number
): EmbedBuilder {
  return new EmbedBuilder({
    author: {
      name: 'pleasantcord',
      iconURL: process.env.IMAGE_URL,
    },
    title: 'Content Classification Result',
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
      {
        name: 'Model',
        value: config.model,
      },
    ],
    color: process.env.NODE_ENV === 'production' ? ORANGE : BLUE,
  });
}
