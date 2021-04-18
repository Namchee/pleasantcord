import { Guild } from 'discord.js';

import { Logger, LogLevel } from '../../service/logger';
import { BotContext } from '../types';
import { syncModerationChannels } from '../utils';

export default {
  event: 'guildCreate',
  fn: async ({ config }: BotContext, guild: Guild): Promise<void> => {
    await syncModerationChannels(
      guild,
      config,
    );

    Logger.getInstance().logBot(
      // eslint-disable-next-line max-len
      `Successfully initialized ${config.name}'s moderation channel on ${guild.name} (#${guild.id})`,
      LogLevel.INFO,
    );
  },
};
