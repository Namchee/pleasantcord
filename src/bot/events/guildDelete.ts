import { Guild } from 'discord.js';

import { BotContext } from '../types';
import { handleError } from './../utils';

export default {
  event: 'guildDelete',
  fn: async (
    { configRepository }: BotContext,
    guild: Guild,
  ): Promise<void> => {
    try {
      await configRepository.deleteConfig(guild.id);
    } catch (err) {
      handleError(err as Error);
    }
  },
};
