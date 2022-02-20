import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Constants, Message, MessageEmbed } from 'discord.js';

import { Content } from '../entity/content';

import { CommandHandler, CommandHandlerFunction, EventHandler } from './types';

import { PERMISSION_ERRORS } from '../constants/error';
import { RED } from '../constants/color';
import { PREFIX } from '../constants/command';
import { CLASSIFIABLE_CONTENTS, PLACEHOLDER_NAME } from '../constants/content';

import { Logger } from '../utils/logger';

// this cannot be tested at the moment. Context: https://github.com/vitest-dev/vitest/issues/110
/* c8 ignore start */

// cache this
let commandList: CommandHandler[];
let commandMap: Record<string, CommandHandlerFunction>;

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
 * Get command map for user interaction.
 *
 * @returns {Record<string, CommandHandlerFunction>} mapped commands
 */
export function getCommandMap(): Record<string, CommandHandlerFunction> {
  if (!commandMap) {
    const commands = getCommands();
    commandMap = {};

    commands.forEach((handler: CommandHandler) => {
      commandMap[handler.command] = handler.fn;
    });
  }

  return commandMap;
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
export function getMessageCommand(msg: string): string {
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
        name: name || PLACEHOLDER_NAME,
        url,
      });
    }
  });

  msg.embeds.forEach(({ url, image, video, thumbnail }) => {
    const contentUrl = video?.url || image?.url || thumbnail?.url || url || '';

    if (contentUrl) {
      contents.push({
        name: PLACEHOLDER_NAME,
        url: contentUrl,
      });
    }
  });

  return contents;
}
