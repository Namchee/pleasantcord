import {
  Collection,
  Guild,
  GuildMember,
  OverwriteResolvable,
} from 'discord.js';

import { BotConfig, BotContext } from '../types';

async function syncModerationChannels(
  guilds: Collection<string, Guild>,
  { modLog }: BotConfig,
): Promise<void> {
  // setup channel for bot log
  const resolveChannels = guilds.map(async (guild) => {
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
  });

  await Promise.all(resolveChannels);
}

export default {
  event: 'ready',
  once: true,
  fn: async ({ client, config }: BotContext): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${config.name} is now ready to moderate servers`);
    }

    const setPresence = client.user?.setPresence({
      status: 'online',
      activity: {
        name: 'for NSFW contents ⚖️',
        type: 'WATCHING',
      },
    });

    const syncChannels = syncModerationChannels(
      client.guilds.cache,
      config,
    );

    await Promise.all([setPresence, syncChannels]);
  },
};
