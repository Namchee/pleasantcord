import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import {
  Constants,
  DiscordAPIError,
  Guild,
  GuildMember,
  MessageEmbed,
  OverwriteResolvable,
} from 'discord.js';

import { BotConfig, CommandHandler, EventHandler } from './types';
import { DBException } from '../exceptions/db';
import { Logger, LogLevel } from '../service/logger';


export function getCommands(): CommandHandler[] {
  const basePath = resolve(__dirname, 'events', 'commands');

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
        `${config.name} lacks the required permissions to perform its duties`,
      );

      errorMessage.addField(
        'Solution',
        // eslint-disable-next-line max-len
        `Please make sure that ${config.name} has sufficient permissions as stated in the documentation to manage this server`,
      );
    } else {
      errorMessage.setTitle(err.name);
      errorMessage.setDescription(err.message);
    }
  } else {
    if (err instanceof DBException) {
      errorMessage.setTitle('Data Management Error');
      errorMessage.setDescription(
        // eslint-disable-next-line max-len
        'There\'s an error on data management. Please contact the developer immediately',
      );
    } else {
      Logger.getInstance().logBot(err.message, LogLevel.ERROR);

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

export async function syncModerationChannels(
  guild: Guild,
  { modLog }: BotConfig,
): Promise<void> {
  // setup channel for bot log
  let categoryChannel = guild.channels.cache.find(
    channel => channel.name === modLog.category &&
      channel.type === 'category',
  );

  let textChannel = guild.channels.cache.find(
    channel => channel.name === modLog.channel &&
      channel.type === 'text',
  );

  const permissions: OverwriteResolvable[] = guild.roles.cache.map(
    (role) => {
      return {
        id: role.id,
        allow: [
          'VIEW_CHANNEL',
          'READ_MESSAGE_HISTORY',
        ],
        deny: [
          'SEND_MESSAGES',
          'ADD_REACTIONS',
          'MANAGE_MESSAGES',
        ],
      };
    },
  );

  if (!categoryChannel) {
    categoryChannel = await guild.channels.create(
      modLog.category,
      {
        type: 'category',
        permissionOverwrites: permissions,
      },
    );
  } else {
    categoryChannel.overwritePermissions([
      ...permissions,
    ]);
  }

  await categoryChannel.overwritePermissions([
    {
      id: guild.me as GuildMember,
      allow: [
        'SEND_MESSAGES',
      ],
    },
  ]);

  if (!textChannel) {
    textChannel = await guild.channels.create(
      modLog.channel,
      {
        type: 'text',
        parent: categoryChannel,
        permissionOverwrites: permissions,
      },
    );
  } else {
    await textChannel.overwritePermissions([
      ...permissions,
    ]);
  }

  await textChannel.overwritePermissions([
    {
      id: guild.me as GuildMember,
      allow: [
        'SEND_MESSAGES',
      ],
    },
  ]);
}
