import { Guild } from 'discord.js';

import { BASE_CONFIG } from '../../entity/config';
import { BotContext } from '../types';
import { handleError } from './../utils';

export default {
  event: 'guildCreate',
  fn: async (
    { configRepository }: BotContext,
    guild: Guild,
  ): Promise<void> => {
    try {
      // create guild config when the bot enters a guild.
      await configRepository.createConfig(guild.id, BASE_CONFIG);
    } catch (err) {
      handleError(err as Error);
    }
  },
};
