import { Guild } from 'discord.js';
import { Logger, LogLevel } from '../../service/logger';

import { BotContext } from '../types';

export default {
  name: 'guildDelete',
  fn: async ({ config }: BotContext, guild: Guild): Promise<void> => {
    const { modLog } = config;
    const { category, channel: modName } = modLog;

    const categoryChannel = guild.channels.cache.find(
      channel => channel.type === 'category' && channel.name === category,
    );

    if (!categoryChannel) {
      Logger.getInstance().logBot(
        // eslint-disable-next-line max-len
        `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Category channel does not exist`,
        LogLevel.ERROR,
      );

      return;
    }

    if (!categoryChannel.deletable || !categoryChannel.deleted) {
      Logger.getInstance().logBot(
        // eslint-disable-next-line max-len
        `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Category channel is not deletable`,
        LogLevel.ERROR,
      );

      return;
    }

    const textChannel = guild.channels.cache.find((channel) => {
      return channel.type === 'text' &&
        channel.name === modName &&
        channel.parent !== null &&
        channel.parent === categoryChannel;
    });

    if (!textChannel) {
      Logger.getInstance().logBot(
        // eslint-disable-next-line max-len
        `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Text channel does not exist`,
        LogLevel.ERROR,
      );

      return;
    }

    if (!textChannel.deletable || !textChannel.deleted) {
      Logger.getInstance().logBot(
        // eslint-disable-next-line max-len
        `${config.name} on ${guild.name} (#${guild.id}) is misconfigured: Text channel is not deletable`,
        LogLevel.ERROR,
      );

      return;
    }

    await Promise.all([
      categoryChannel.delete(`${config.name} cleanup hook`),
      textChannel.delete(`${config.name} cleanup hook`),
    ]);
  },
};
