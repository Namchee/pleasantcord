import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Constants, Message, MessageEmbed, TextChannel } from 'discord.js';

import { Pool, spawn, FunctionThread, Worker } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';

import { Category, Content } from '../entity/content';

import {
  BotContext,
  ClassificationResult,
  CommandHandler,
  EventHandler,
} from './types';

import { Classifier } from './../service/workers';

import { BASE_CONFIG } from './../entity/config';

import { PERMISSION_ERRORS } from '../constants/error';
import { BLUE, ORANGE, RED } from '../constants/color';
import { PREFIX } from '../constants/command';
import { CLASSIFIABLE_CONTENTS } from '../constants/content';

import { Logger } from '../utils/logger';

const workers = Pool(() => spawn<Classifier>(new Worker(`../service/workers`)));

// this cannot be tested at the moment. Context: https://github.com/vitest-dev/vitest/issues/110
/* c8 ignore start */

// cache this
let commandList: CommandHandler[];

/**
 * Get all available commands from command files.
 *
 * @returns {CommandHandler[]} list of command handlers.
 */
export function getCommands(): CommandHandler[] {
  if (!commandList) {
    const basePath = resolve(__dirname, 'commands');
    const commandFiles = readdirSync(basePath);

    commandList = commandFiles.map((commandFile: string) => {
      const file = require(resolve(basePath, commandFile));

      const { command, description, fn } = file.default as CommandHandler;

      return {
        command,
        description,
        fn,
      };
    });
  }

  return commandList;
}

/**
 * Get all available event handlers from event files.
 *
 * @returns {EventHandler[]} list of event handlers.
 */
export function getEvents(): EventHandler[] {
  const basePath = resolve(__dirname, 'events');
  const eventFiles = readdirSync(basePath);

  const events = eventFiles.map((eventFile: string) => {
    const file = require(resolve(basePath, eventFile));

    const { event, once, fn } = file.default as EventHandler;

    return {
      event,
      once: once || false,
      fn,
    };
  });

  return events;
}

/* c8 ignore end */

/**
 * Catch all errors thrown by the bot and construct the appropriate
 * error message. Will report the error when an unexpected errors
 * are caught.
 *
 * @param {Error} err error object
 * @returns {MessageEmbed} error message.
 */
export function handleError(err: Error): MessageEmbed | null {
  const errorMessage = new MessageEmbed({
    author: {
      name: 'pleasantcord',
      iconURL: process.env.IMAGE_URL,
    },
    color: RED,
  });

  const code: number = (err as any).code ? (err as any).code : 0;

  if (code === Constants.APIErrors.UNKNOWN_MESSAGE) {
    // this is caused by double deletion, kindly ignore this
    return null;
  }

  if (PERMISSION_ERRORS.includes(code)) {
    errorMessage.setTitle('Insufficient Permissions');
    errorMessage.setDescription(
      `\`pleasantcord\` lacks the required permissions to perform its duties`
    );

    errorMessage.addField(
      'Solution',
      `Please make sure that \`pleasantcord\` has all the required permissions as stated in the documentation to manage this server and please make sure that \`pleasantcord\` has sufficient access rights to target channels`
    );
  } else {
    Logger.getInstance().logBot(err);

    errorMessage.setTitle('Ouch!');
    errorMessage.setDescription(
      "Unfortunately, `pleasantcord` has encountered an unexpected error. Don't worry, the error has been reported to the system and will be resolved as soon as possible.\n\nIf this issue persists, please submit an issue to [GitHub](https://github.com/Namchee/pleasantcord/issues) or join [our support server](https://discord.gg/Pj4aGp8Aky) and submit your bug report on the appropriate channel."
    );
  }

  return errorMessage;
}

/**
 * Get actual command from user message
 *
 * @param {string} msg user message
 * @returns {string} command name
 */
export function getCommand(msg: string): string {
  return msg.slice(PREFIX.length).trim().split(/ +/)[0];
}

/**
 * Get all supported contents from a user message
 *
 * @param {Message} msg user message
 * @returns {Content[]} list of detectable contents
 */
export function getSupportedContents(msg: Message): Content[] {
  const contents: Content[] = [];

  msg.attachments.forEach(({ url, name, contentType }) => {
    if (!!contentType && CLASSIFIABLE_CONTENTS.includes(contentType)) {
      contents.push({
        name: name || 'attachment',
        url,
      });
    }
  });

  msg.embeds.forEach(({ url, image, video, thumbnail }) => {
    if (url && (image || video || thumbnail)) {
      contents.push({
        name: 'embed-content',
        url: url,
      });
    }
  });

  return contents;
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
