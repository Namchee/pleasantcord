import { Client } from 'discord.js';
import { handleError } from './../utils';

export default {
  event: 'ready',
  once: true,
  fn: async (client: Client): Promise<void> => {
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
    } catch (err) {
      handleError(err as Error);
    }
  },
};
