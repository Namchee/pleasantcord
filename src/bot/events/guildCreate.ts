import { Guild } from 'discord.js';

import { BASE_CONFIG } from '@/entity/config';
import { handleError } from '@/bot/utils';

import type { BotContext } from '@/bot/types';

export default {
  event: 'guildCreate',
  fn: async ({ service }: BotContext, guild: Guild): Promise<void> => {
    try {
      // create guild config when the bot enters a guild.
      await service.createConfig(guild.id, BASE_CONFIG);
    } catch (err) {
      handleError(err as Error);
    }
  },
};
