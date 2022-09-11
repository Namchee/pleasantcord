import { ActivityType } from 'discord.js';
import { BotContext } from '../types.js';
import { handleError } from './../utils.js';

export default {
  event: 'ready',
  once: true,
  fn: async ({ client, service }: BotContext): Promise<void> => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`pleasantcord is now ready to moderate servers`);
    }

    try {
      // set required authentication data
      service.repository.setBotId(client.user?.id as string);

      client.user?.setPresence({
        status: 'online',
        activities: [
          {
            name: 'for graphical contents 👀',
            type: ActivityType.Watching,
          },
        ],
      });
    } catch (err) {
      handleError(err as Error);
    }
  },
};
