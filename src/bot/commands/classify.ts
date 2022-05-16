import { MessageEmbed } from 'discord.js';
import {
  classifyContent,
  generateClassificationResultLog,
} from '../service/classifier';

import { BotContext, CommandHandlerParams } from '../types';
import { RecoverableError } from './../../exceptions/recoverable';

export default {
  command: 'Classify Content',
  description:
    'Classify the selected content without performing content moderation',
  fn: async (
    ctx: BotContext,
    { guild, message }: CommandHandlerParams
  ): Promise<MessageEmbed[] | undefined> => {
    if (!message) {
      return;
    }

    const config = await ctx.service.getConfig(guild.id);

    if (!config) {
      throw new RecoverableError(
        'Configuration data does not exist for this server. Please re-invite the bot to automatically fix this problem.'
      );
    }

    const results = classifyContent(message, config, true);
    const embeds: MessageEmbed[] = [];

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
