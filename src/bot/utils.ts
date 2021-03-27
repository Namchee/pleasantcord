import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';

import { CommandHandler, EventHandler } from './types';
import config from './../config/env';

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
