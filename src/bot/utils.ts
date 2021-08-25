import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Constants, DiscordAPIError, MessageEmbed } from 'discord.js';

import { CommandHandler, EventHandler } from './types';
import { Logger } from '../utils/logger';

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

export function handleError(
  err: Error,
): MessageEmbed {
  const errorMessage = new MessageEmbed({
    author: {
      name: 'pleasantcord',
      iconURL: '',
    },
    color: '#E53E3E',
  });

  if (
    err instanceof DiscordAPIError &&
    err.code === Constants.APIErrors.MISSING_PERMISSIONS
  ) {
    errorMessage.setTitle('Insufficient Permissions');
    errorMessage.setDescription(
      `\`pleasantcord\` lacks the required permissions to perform its duties`,
    );

    errorMessage.addField(
      'Solution',
      // eslint-disable-next-line max-len
      `Please make sure that \`pleasantcord\` has all the required permissions as stated in the documentation to manage this server`,
    );
  } else {
    Logger.getInstance().logBot(err);

    errorMessage.setTitle('Ouch!');
    errorMessage.setDescription(
      // eslint-disable-next-line max-len
      '`pleasantcord` has encountered an unexpected error. The error has been reported to the system. Please try again.',
    );
  }

  return errorMessage;
}
