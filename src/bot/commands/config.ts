import { EmbedBuilder } from 'discord.js';

import { BLUE, ORANGE } from '../../constants/color.js';

import { BotContext, CommandHandlerParams } from '../types.js';
import { RecoverableError } from './../../exceptions/recoverable.js';

export default {
  command: 'config',
  description: 'Show configuration for the current server',
  type: 'CHAT_INPUT',
  fn: async (
    { service }: BotContext,
    { guild }: CommandHandlerParams
  ): Promise<EmbedBuilder[]> => {
    const config = await service.getConfig(guild.id);

    if (!config) {
      throw new RecoverableError(
        'Configuration data does not exist for this server. Please re-invite the bot to automatically fix this problem.'
      );
    }

    return [
      new EmbedBuilder({
        author: {
          name: 'pleasantcord',
          iconURL: process.env.IMAGE_URL,
        },
        title: 'Server Configuration',
        fields: [
          {
            name: 'Minimum Threshold',
            value: `${(config?.accuracy * 100).toFixed(2)}%`,
          },
          {
            name: 'NSFW Categories',
            value: config.categories.join('\n'),
            inline: true,
          },
          {
            name: 'Scanned Contents',
            value: config.contents.join('\n'),
            inline: true,
          },
          {
            name: 'Action',
            value: config.delete ? 'Delete' : 'Repost with blur',
          },
          {
            name: 'Classifier Name',
            value: config.model,
          },
          {
            name: 'Dashboard Link',
            value:
              '[https://pleasantcord.namchee.dev](https://pleasantcord.namchee.dev)',
          },
        ],
        color: process.env.NODE_ENV === 'development' ? BLUE : ORANGE,
      }),
    ];
  },
};
