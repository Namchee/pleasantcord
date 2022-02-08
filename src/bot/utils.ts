import { readdirSync } from 'fs';
import { resolve } from 'path';
import { URL } from 'url';
import { Constants, Message, MessageEmbed } from 'discord.js';

import { Content } from '../entity/content';

import { CommandHandler, EventHandler } from './types';
import { Logger } from '../utils/logger';

import { PERMISSION_ERRORS } from '../constants/error';
import { RED } from '../constants/color';
import { PREFIX } from '../constants/command';
import {
  CONTENT_EXTENSION,
  CONTENT_TYPE,
  GIF_PROVIDER,
} from '../constants/content';

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
    if (!!contentType && CONTENT_TYPE.includes(contentType)) {
      contents.push({
        type: contentType === 'image/gif' ? 'gif' : 'image',
        name: name || 'attachment.jpg',
        url,
      });
    }
  });

  msg.embeds.forEach(({ url, image, thumbnail }) => {
    if (url) {
      const { pathname, host } = new URL(url);

      // this is probably a GIF
      if (GIF_PROVIDER.some(p => host.match(p))) {
        contents.push({
          type: 'gif',
          name: 'embed.gif',
          url: url,
        });
      } else {
        // check the extensions
        const extension = pathname.split('.').pop();

        if (extension && CONTENT_EXTENSION.includes(extension)) {
          const type = extension == 'gif' ? 'gif' : 'image';

          contents.push({
            type: type,
            name: `embed.${type}`,
            url: url,
          });
        }
      }

      return;
    }

    if (image) {
      const { pathname } = new URL(image.url);
      const extension = pathname.split('.').pop();

      contents.push({
        type: 'image',
        name: `embed.${extension}`,
        url: image.url,
      });

      return;
    }

    if (thumbnail) {
      const { pathname } = new URL(thumbnail.url);
      const extension = pathname.split('.').pop();

      contents.push({
        type: 'image',
        name: `embed.${extension}`,
        url: thumbnail.url,
      });

      return;
    }
  });

  return contents;
}
