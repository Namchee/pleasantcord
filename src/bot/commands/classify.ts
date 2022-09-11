import { EmbedBuilder } from 'discord.js';
import {
  classifyContent,
  generateClassificationResultLog,
} from '../service/classifier.js';

import { BotContext, CommandHandlerParams } from '../types.js';
import { RecoverableError } from './../../exceptions/recoverable.js';

export default {
  command: 'Classify Content',
  description:
    'Classify the selected content without performing content moderation',
  type: 'MESSAGE',
  fn: async (
    ctx: BotContext,
    { guild, message }: CommandHandlerParams
  ): Promise<EmbedBuilder[] | undefined> => {
    if (!message) {
      return;
    }

    const config = await ctx.service.getConfig(guild.id);

    if (!config) {
      throw new RecoverableError(
        'Configuration data does not exist for this server. Please re-invite the bot to automatically fix this problem.'
      );
    }

    const results = classifyContent(
      message,
      config,
      ctx.pool,
      process.env.NODE_ENV === 'development'
    );
    const embeds: EmbedBuilder[] = [];

    for await (const result of results) {
      const embed = generateClassificationResultLog(
        result.categories,
        config,
        result.time as number
      );

      embeds.push(embed);
    }

    return embeds;
  },
};
