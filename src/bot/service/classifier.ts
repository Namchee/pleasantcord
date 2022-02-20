import { Message, TextChannel, MessageEmbed } from 'discord.js';
import { FunctionThread, Pool, spawn, Worker } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';

import { Classifier } from './../../service/workers';

import { BASE_CONFIG } from './../../entity/config';
import { Content } from './../../entity/content';

import { BLUE, ORANGE } from './../../constants/color';

import { BotContext, ClassificationResult } from '../types';

import { getSupportedContents } from '../utils';
import { Logger } from './../../utils/logger';

export const workers = Pool(() =>
  spawn<Classifier>(new Worker('../../service/workers'))
);

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

      const categories = await classifier(url, config.model);

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

    const nsfwCategory = categories.find(cat => {
      return (
        config.categories.includes(cat.name) && cat.accuracy >= config.accuracy
      );
    });

    const promises = [];

    if (nsfwCategory) {
      // make sure that all queued tasks are killed
      tasks.forEach(t => t.cancel());

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

      if (msg.deletable) {
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
          {
            name: 'Model',
            value: config.model,
          },
        ],
        color: BLUE,
      });

      promises.push(channel.send({ embeds: [devEmbed] }));
    }

    await Promise.all(promises);

    if (nsfwCategory) {
      break;
    }
  }
}
