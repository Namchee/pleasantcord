import { Message, MessageEmbed } from 'discord.js';

import { Strike } from '../../../models/strike';
import { BotContext } from '../../types';

export default {
  command: 'strikes',
  description: 'Get all active strikes on the current server',
  fn: async (
    { config, repository }: BotContext,
    msg: Message,
  ): Promise<Message> => {
    const { guild } = msg;

    const strikes = await repository.getStrikes(guild?.id as string);

    let contents = '';

    if (!strikes.length) {
      // eslint-disable-next-line max-len
      contents += '\nNone! Everyone in this server is posting safe contents!';
    } else {
      strikes.forEach((strike: Strike) => {
        const { userId, count } = strike;

        // eslint-disable-next-line max-len
        contents += `\n**${guild?.members.cache.get(userId)}** — ${count} strikes`;
      });
    }

    const messageEmbed = new MessageEmbed({
      author: {
        name: `${config.name}`,
        iconURL: config.imageUrl,
      },
      color: config.embedColor,
      title: `${guild?.name} Strikes Report`,
      fields: [
        {
          name: 'Strikers',
          value: contents,
        },
        {
          name: 'Strikers Count',
          value: strikes.length,
        },
      ],
    });

    return msg.channel.send(messageEmbed);
  },
};
