import { readdirSync } from 'fs';

import { Message, EmbedBuilder, RESTJSONErrorCodes } from 'discord.js';

import { Content } from '../entity/content';

import { RecoverableError } from '../exceptions/recoverable';

import { CommandHandler, EventHandler } from './types';

import { PERMISSION_ERRORS } from '../constants/error';
import { RED } from '../constants/color';
import { PREFIX } from '../constants/command';
import {
  CDN,
  PLACEHOLDER_NAME,
  SUPPORTED_CONTENTS,
} from '../constants/content';

import { Logger } from '../utils/logger';

// this cannot be tested at the moment. Context: https://github.com/vitest-dev/vitest/issues/110
/* c8 ignore start */

// cache this
let commands: Record<string, CommandHandler>;

/**
 * Get all available commands from command files.
 *
 * @returns {Record<string, CommandHandler>[]} list of command handlers.
 */
export async function getCommands(): Promise<Record<string, CommandHandler>> {
  if (!commands) {
    const basePath = new URL('commands', import.meta.url);
    const commandFiles = readdirSync(basePath);

    commands = {};

    const loader = await Promise.all(
      commandFiles.map(async (cmd: string) => {
        const file = await import(new URL(`commands/${cmd}`, basePath).href);

        return file.default as CommandHandler;
      })
    );

    loader.forEach(val => (commands[val.command] = val));
  }

  return commands;
}

/**
 * Get all available event handlers from event files.
 *
 * @returns {EventHandler[]} list of event handlers.
 */
export function getEvents(): Promise<EventHandler[]> {
  const base = new URL('events', import.meta.url);
  const eventFiles = readdirSync(base);

  return Promise.all(
    eventFiles.map(async (ev: string) => {
      const file = await import(new URL(`events/${ev}`, base).href);

      const { event, once, fn } = file.default as EventHandler;

      return {
        event,
        once: once || false,
        fn,
      };
    })
  );
}

/* c8 ignore end */

/**
 * Catch all errors thrown by the bot and construct the appropriate
 * error message. Will report the error when an unexpected errors
 * are caught.
 *
 * @param {Error} err error object
 * @returns {EmbedBuilder} error message.
 */
export function handleError(err: Error): EmbedBuilder | null {
  const errorMessage = new EmbedBuilder({
    author: {
      name: 'pleasantcord',
      iconURL: process.env.IMAGE_URL,
    },
    color: RED,
  });

  const code: number = (err as any).code ? (err as any).code : 0;

  if (code === RESTJSONErrorCodes.UnknownMessage) {
    // this is caused by double deletion, kindly ignore this
    return null;
  }

  if (PERMISSION_ERRORS.includes(code)) {
    errorMessage.setTitle('Insufficient Permissions');
    errorMessage.setDescription(
      `\`pleasantcord\` lacks the required permissions to perform its duties`
    );

    errorMessage.addFields([
      {
        name: 'Solution',
        value: `Please make sure that \`pleasantcord\` has all the required permissions as stated in the documentation to manage this server and please make sure that \`pleasantcord\` has sufficient access rights to target channels`,
      },
    ]);
  } else {
    Logger.getInstance().logBot(err);

    errorMessage.setTitle('Ouch!');
    errorMessage.setDescription(
      err instanceof RecoverableError
        ? err.message
        : 'Unfortunately, `pleasantcord` has encountered an unexpected error. The error has been reported to the system and will be resolved as soon as possible.\n\nIf this issue persists, please submit an issue to [GitHub](https://github.com/Namchee/pleasantcord/issues) or join [our support server](https://discord.gg/Pj4aGp8Aky) and submit your bug report on the appropriate channel.'
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
export function getCommandFromMessage(msg: string): string {
  return msg.slice(PREFIX.length).trim().split(/ +/)[0];
}

/**
 * Get emoji ID from user message
 *
 * @param {string} content message contents
 * @returns {string[]} array of Snowflare IDs
 */
function getEmojisFromText(content: string): string[] {
  const pattern = /<:\w+:(\d+)>/g;

  const group = [...content.matchAll(pattern)];

  return group.map(val => val[1]);
}

/**
 * Get all supported contents from a user message
 *
 * @param {Message} msg user message
 * @param {boolean} sticker whether stickers should be included or
 * not
 * @returns {Content[]} list of detectable contents
 */
export function getFilterableContents(
  msg: Message,
  sticker = false
): Content[] {
  const contents: Content[] = [];

  msg.attachments.forEach(({ url, name, contentType }) => {
    if (!!contentType && SUPPORTED_CONTENTS.includes(contentType)) {
      contents.push({
        name: name || PLACEHOLDER_NAME,
        url,
      });
    }
  });

  msg.embeds.forEach(({ data }) => {
    const { url, image, video, thumbnail } = data;
    const contentUrl = video?.url || image?.url || thumbnail?.url || url || '';

    if (contentUrl) {
      contents.push({
        name: PLACEHOLDER_NAME,
        url: contentUrl,
      });
    }
  });

  if (sticker) {
    const emojis = getEmojisFromText(msg.content).map(id => {
      return {
        name: PLACEHOLDER_NAME,
        url: `${CDN}/${id}.png`,
      };
    });

    contents.push(...emojis);

    msg.stickers.forEach(sticker => {
      contents.push({
        name: PLACEHOLDER_NAME,
        url: sticker.url,
      });
    });
  }

  return contents;
}
