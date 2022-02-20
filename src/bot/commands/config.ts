import { MessageEmbed } from 'discord.js';

import { BLUE, ORANGE } from '../../constants/color';

import { BotContext, CommandHandlerParams } from '../types';

export default {
  command: 'config',
  description: 'Show configuration for the current server',
  fn: async (
    { service }: BotContext,
    { guild }: CommandHandlerParams
  ): Promise<MessageEmbed> => {
    const config = await service.getConfig(guild.id);

    if (!config) {
      throw new Error(`Failed to get configuration for server ${guild.id}`);
    }

    return new MessageEmbed({
      author: {
        name: 'pleasantcord',
        iconURL: process.env.IMAGE_URL,
      },
      title: 'Server Configuration',
      fields: [
        {
          name: 'Threshold',
          value: `${(config?.accuracy * 100).toFixed(2)}%`,
        },
        {
          name: 'Categories',
          value: config.categories.join('\n'),
          inline: true,
        },
        {
          name: 'Action',
          value: config.delete ? 'Delete' : 'Blur',
          inline: true,
        },
        {
          name: 'Model',
          value: config.model,
        },
        {
          name: 'Dashboard Link',
          value:
            '[https://pleasantcord.namchee.dev](https://pleasantcord.namchee.dev)',
        },
      ],
      color: process.env.NODE_ENV === 'development' ? BLUE : ORANGE,
    });
  },
};
