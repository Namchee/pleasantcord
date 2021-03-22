import { BotContext } from './../common/types';
import { resolve } from 'path';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export default {
  event: 'ready',
  once: true,
  fn: async ({ client }: BotContext): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${config.name} is now ready to moderate servers`);
    }

    await client.user?.setPresence({
      status: 'online',
      activity: {
        name: 'all possible NSFW contents ⚖️',
        type: 'WATCHING',
      },
    });
  },
};
