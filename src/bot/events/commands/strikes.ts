import { Message, MessageEmbed } from 'discord.js';

import { Strike } from '../../../models/strike';
import { BotContext } from '../../types';

export default {
  command: 'strikes',
  description: 'Get all active strikes on the current server',
  fn: async (
    { config, repository }: BotContext,
    msg: Message,
  ): Promise<void> => {
    const { guild } = msg;

    const strikes = await repository.getStrikes(guild?.id as string);
    const invalidStrikes: { serverId: string; userId: string }[] = [];

    let contents = '';

    if (!strikes.length) {
      // eslint-disable-next-line max-len
      contents += '\nNone! Everyone in this server is posting safe contents!';
    } else {
      strikes.forEach((strike: Strike) => {
        const { serverId, userId, count } = strike;
        const now = new Date();

        if (
          !strike.hasExpired(now, config.strike.refreshPeriod) &&
          guild?.members.cache.has(strike.userId)
        ) {
          // eslint-disable-next-line max-len
          contents += `\n**${guild?.members.cache.get(userId)}** — ${count} strikes`;
        } else {
          invalidStrikes.push({ serverId, userId });
        }
      });
    }

    const ops = [];

    invalidStrikes.forEach(({ serverId, userId }) => {
      ops.push(repository.clearStrike(serverId, userId));
    });

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
          value: strikes.length - invalidStrikes.length,
        },
      ],
    });

    ops.push(msg.channel.send(messageEmbed));

    await Promise.all(ops);
  },
};
