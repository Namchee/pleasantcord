import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { Constants, DiscordAPIError, Message, MessageEmbed } from 'discord.js';

import { BotConfig, CommandHandler, EventHandler } from './types';
import config from './../config/env';
import { DBException } from '../exceptions/db';

const { bot } = config;

export function getCommands(): CommandHandler[] {
  const basePath = resolve(__dirname, 'events', 'commands');

  const commandFiles = readdirSync(basePath);

  const commands = commandFiles.map((commandFile: string) => {
    const file = require(resolve(basePath, commandFile));

    const { command, description, fn } = file.default as CommandHandler;

    return {
      command: `\`${bot.prefix}${command}\``,
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
    .filter((eventFile: string) => {
      return !statSync(resolve(basePath, eventFile)).isDirectory();
    })
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

export function errorHandler(config: BotConfig, err: Error): MessageEmbed {
  const errorMessage = new MessageEmbed({
    author: {
      name: config.name,
      iconURL: config.imageUrl,
    },
    color: '#E53E3E',
  });

  if (err instanceof DiscordAPIError) {
    if (err.code === Constants.APIErrors.MISSING_PERMISSIONS) {
      errorMessage.setTitle('Insufficient Permissions');
      errorMessage.setDescription(
        // eslint-disable-next-line max-len
        `${config.name.toUpperCase()} lacks required permissions to perform its duties. Make sure that ${config.name.toUpperCase()} has sufficient permissions as stated in the documentation to manage this server`,
      );
    } else {
      errorMessage.setTitle(err.name);
      errorMessage.setAuthor(err.message);
    }
  } else {
    if (err instanceof DBException) {
      errorMessage.setTitle('Data Management Error');
      errorMessage.setDescription(
        // eslint-disable-next-line max-len
        'There\'s an error on data management. Please contact the developer immediately',
      );
    } else {
      errorMessage.setTitle('Uncaught Exceptions Thrown');
      errorMessage.setDescription(
        // eslint-disable-next-line max-len
        'There\'s an unexpected error throw by the bot. Please contact the developer immediately',
      );
    }

    errorMessage.addField(
      'Stacktrace',
      err.stack,
    );
  }

  return errorMessage;
}
