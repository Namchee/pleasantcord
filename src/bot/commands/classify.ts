import { MessageEmbed } from 'discord.js';

import { BotContext, CommandHandlerParams } from '../types';
import { RecoverableError } from './../../exceptions/recoverable';

export default {
  command: 'Classify Content',
  description:
    'Classify the selected content without performing content moderation',
  fn: async (
    { service }: BotContext,
    { guild }: CommandHandlerParams
  ): Promise<MessageEmbed> => {
    const config = await service.getConfig(guild.id);

    if (!config) {
      throw new RecoverableError(
        'Configuration data does not exist for this server. Please re-invite the bot to automatically fix this problem.'
      );
    }
  },
};
