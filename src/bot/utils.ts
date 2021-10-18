import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Constants, DiscordAPIError, MessageEmbed } from 'discord.js';

import { CommandHandler, EventHandler } from './types';
import { Logger } from '../utils/logger';
import { PERMISSION_ERRORS } from '../constants/error';

/**
 * Get all available commands from command files.
 *
 * @returns {CommandHandler[]} list of command handlers.
 */
export function getCommands(): CommandHandler[] {
  const basePath = resolve(__dirname, 'commands');
  const commandFiles = readdirSync(basePath);

  const commands = commandFiles.map((commandFile: string) => {
    const file = require(resolve(basePath, commandFile));

    const { command, description, fn } = file.default as CommandHandler;

    return {
      command,
      description,
      fn,
    };
  });

  return commands;
}

/**
 * Get all available event handlers from event files.
 *
 * @returns {EventHandler[]} list of event handlers.
 */
export function getEvents(): EventHandler[] {
  const basePath = resolve(__dirname, 'events');
  const eventFiles = readdirSync(basePath);

  const events = eventFiles
    .map((eventFile: string) => {
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

/**
 * Catch all errors thrown by the bot and construct the appropriate
 * error message. Will report the error when an unexpected errors
 * are caught.
 *
 * @param {Error} err error object
 * @returns {MessageEmbed} error message.
 */
export function handleError(
  err: Error,
): MessageEmbed | null {
  const errorMessage = new MessageEmbed({
    author: {
      name: 'pleasantcord',
      iconURL: process.env.IMAGE_URL,
    },
    color: '#CD2B31',
  });

  if (err instanceof DiscordAPIError) {
    if (err.code === Constants.APIErrors.UNKNOWN_MESSAGE) {
      // this is caused by double deletion, kindly ignore this
      return null;
    }

    if (PERMISSION_ERRORS.includes(err.code)) {
      errorMessage.setTitle('Insufficient Permissions');
      errorMessage.setDescription(
        `\`pleasantcord\` lacks the required permissions to perform its duties`,
      );

      errorMessage.addField(
        'Solution',
        // eslint-disable-next-line max-len
        `Please make sure that \`pleasantcord\` has all the required permissions as stated in the documentation to manage this server and please make sure that \`pleasantcord\` has sufficient access rights to target channels`,
      );
    }
  } else {
    Logger.getInstance().logBot(err);

    errorMessage.setTitle('Ouch!');
    errorMessage.setDescription(
      // eslint-disable-next-line max-len
      'Unfortunately, `pleasantcord` has encountered an unexpected error. Don\'t worry, the error has been reported to the system and will be resolved as soon as possible.\n\nIf this issue persists, please submit an issue to [GitHub](https://github.com/Namchee/pleasantcord/issues) or join [our support server](https://discord.gg/Pj4aGp8Aky) and submit your bug report on the appropriate channel.',
    );
  }

  return errorMessage;
}
