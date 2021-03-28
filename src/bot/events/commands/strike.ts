import { Message, MessageEmbed } from 'discord.js';
import { DateTime } from 'luxon';

import { BotContext } from '../../types';

export default {
  command: 'strike',
  description: 'Get the sender strike count on the current server',
  fn: async (
    { config, repository }: BotContext,
    msg: Message,
  ): Promise<void> => {
    const { guild, author } = msg;

    let expirationTime = '';

    const strike = await repository
      .getStrike(guild?.id as string, author.id);

    const now = new Date();
    let hasExpired = true;

    if (strike && !strike.hasExpired(now, config.strike.refreshPeriod)) {
      expirationTime = DateTime.fromJSDate(strike.lastUpdated)
        .plus({ seconds: config.strike.refreshPeriod })
        .toRelative() as string;

      hasExpired = false;
    }

    const fields = [
      {
        name: 'Member',
        value: author.toString(),
      },
      {
        name: 'Current Strikes',
        value: strike && !hasExpired ? strike.count : 0,
      },
      {
        name: 'Expiration Time',
        value: expirationTime || '—',
      },
    ];

    const ops: Promise<any>[] = [];

    if (strike && hasExpired) {
      ops.push(repository.clearStrike(guild?.id as string, author.id));
    }

    ops.push(msg.reply(
      new MessageEmbed({
        author: {
          name: config.name,
          iconURL: config.imageUrl,
        },
        title: `${author.username}'s Strikes on ${msg.guild?.name}`,
        color: config.embedColor,
        fields,
      }),
    ));

    await Promise.all(ops);
  },
};
