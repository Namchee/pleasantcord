import { MessageEmbed } from 'discord.js';

import { BASE_CONFIG } from './../../entity/config';

import { BLUE, ORANGE } from '../../constants/color';

import { BotContext, CommandHandlerParams } from '../types';

export default {
  command: 'config',
  description: 'Show configuration for the current server',
  fn: async (
    { service }: BotContext,
    { guild }: CommandHandlerParams
  ): Promise<MessageEmbed> => {
    let config = await service.getConfig(guild.id);

    if (!config) {
      config = BASE_CONFIG;
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
          inline: true,
        },
        {
          name: 'Categories',
          value: config.categories.join('\n'),
          inline: true,
        },
        {
          name: 'Content Types',
          value: config.content.join(', '),
          inline: true,
        },
        {
          name: 'Action',
          value: config.delete ? 'Delete' : 'Blur',
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
