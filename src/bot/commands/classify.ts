import { MessageEmbed } from 'discord.js';
import { classifyContent, moderateContent } from '../service/classifier';

import { BotContext, CommandHandlerParams } from '../types';
import { RecoverableError } from './../../exceptions/recoverable';

export default {
  command: 'Classify Content',
  description:
    'Classify the selected content without performing content moderation',
  fn: async (
    ctx: BotContext,
    { guild }: CommandHandlerParams
  ): Promise<MessageEmbed> => {
    const config = await ctx.service.getConfig(guild.id);

    if (!config) {
      throw new RecoverableError(
        'Configuration data does not exist for this server. Please re-invite the bot to automatically fix this problem.'
      );
    }

    const results = classifyContent(ctx, config);

    for await (const result of results) {
    }
  },
};
