import { Client } from 'discord.js';

export default {
  event: 'ready',
  once: true,
  fn: async (client: Client): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('pleasant-cord is now ready to moderate servers');
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
