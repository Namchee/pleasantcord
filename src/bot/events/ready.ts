import { BASE_CONFIG } from '../../entity/config';
import { BotContext } from '../types';
import { handleError } from './../utils';

export default {
  event: 'ready',
  once: true,
  fn: async ({ client, configRepository }: BotContext): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`pleasantcord is now ready to moderate servers`);
    }

    try {
      client.user?.setPresence({
        status: 'online',
        activities: [
          {
            name: 'for NSFW contents 👀',
            type: 'WATCHING',
          },
        ],
      });

      await Promise.all(
        client.guilds.cache.map(async (guild) => {
          const config = await configRepository.getConfig(guild.id);

          if (!config) {
            await configRepository.createConfig(guild.id, BASE_CONFIG);
          }
        }),
      );
    } catch (err) {
      handleError(err as Error);
    }
  },
};
