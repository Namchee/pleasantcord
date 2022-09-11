import { Message } from 'discord.js';

import { moderateContent } from '../service/classifier.js';

import { handleError } from '../utils.js';

import { BotContext } from '../types.js';

export default {
  event: 'messageUpdate',
  fn: async (
    ctx: BotContext,
    _: Message,
    msg: Message
  ): Promise<Message<boolean> | void> => {
    try {
      if (!msg.guild || !msg.channel.isTextBased() || msg.author.bot) {
        return;
      }

      if (msg.partial) {
        await msg.fetch();
      }

      return moderateContent(ctx, msg);
    } catch (err) {
      const errorEmbed = handleError(err as Error);

      if (errorEmbed) {
        return msg.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};
