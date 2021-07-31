import { BotContext } from '../types';
import { syncModerationChannels } from './../utils';

export default {
  event: 'ready',
  once: true,
  fn: async ({ client, config }: BotContext): Promise<void> => {
    console.log(`${config.name} is now ready to moderate servers`);

    const setPresence = client.user?.setPresence({
      status: 'online',
      activity: {
        name: 'for NSFW contents ⚖️',
        type: 'WATCHING',
      },
    });

    const guildsSync = client.guilds.cache.map((guild) => {
      return syncModerationChannels(
        guild,
        config,
      );
    });

    await Promise.all([setPresence, guildsSync]);
  },
};
