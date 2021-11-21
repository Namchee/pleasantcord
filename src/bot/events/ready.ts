import { BotContext } from '../types';
import { handleError } from './../utils';

export default {
  event: 'ready',
  once: true,
  fn: async ({ client, service }: BotContext): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`pleasantcord is now ready to moderate servers`);
    }

    try {
      // set required authentication data
      service.repository.setBotId(
        client.user?.id as string,
      );

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
