import { Guild } from 'discord.js';

import { BotContext } from '../types';
import { handleError } from '../utils';

export default {
  name: 'guildDelete',
  fn: async ({ config }: BotContext, guild: Guild): Promise<void> => {
    try {
      const { modLog } = config;
      const { category, channel: modName } = modLog;

      const categoryChannel = guild.channels.cache.find(
        channel => channel.type === 'category' && channel.name === category,
      );

      if (!categoryChannel) {
        throw new Error(
          // eslint-disable-next-line max-len
          `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Category channel does not exist`,
        );
      }

      if (!categoryChannel.deletable || !categoryChannel.deleted) {
        throw new Error(
          // eslint-disable-next-line max-len
          `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Category channel is not deletable`,
        );
      }

      const textChannel = guild.channels.cache.find((channel) => {
        return channel.type === 'text' &&
          channel.name === modName &&
          channel.parent !== null &&
          channel.parent === categoryChannel;
      });

      if (!textChannel) {
        throw new Error(
          // eslint-disable-next-line max-len
          `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Text channel does not exist`,
        );
      }

      if (!textChannel.deletable || !textChannel.deleted) {
        throw new Error(
          // eslint-disable-next-line max-len
          `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Text channel is not deletable`,
        );
      }

      await Promise.all([
        categoryChannel.delete(`${config.name} cleanup hook`),
        textChannel.delete(`${config.name} cleanup hook`),
      ]);
    } catch (err) {
      handleError(config, err);
    }
  },
};
