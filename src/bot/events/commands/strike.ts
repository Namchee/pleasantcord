import { Message, MessageEmbed } from 'discord.js';
import { resolve } from 'path';
import { DateTime } from 'luxon';
import { BotContext } from '../../types';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export default {
  command: 'strike',
  description: 'Get the sender strike count on the current server',
  fn: async ({ repository }: BotContext, msg: Message): Promise<Message> => {
    const { guild, author } = msg;

    let expirationTime = '';

    const strike = await repository
      .getStrike(guild?.id as string, author.id);

    if (strike) {
      expirationTime = DateTime.fromJSDate(strike.lastUpdated)
        .plus({ seconds: config.warn.refreshPeriod })
        .toRelative() as string;
    }

    const fields = [
      {
        name: 'Member',
        value: author.toString(),
      },
      {
        name: 'Current Strikes',
        value: strike ? strike.count : 0,
      },
      {
        name: 'Expiration Time',
        value: expirationTime || '—',
      },
    ];

    return msg.reply(
      new MessageEmbed({
        author: {
          name: config.name,
          iconURL: config.imageUrl,
        },
        title: `${author.username}'s Strikes on ${msg.guild?.name}`,
        color: config.embedColor,
        fields,
      }),
    );
  },
};
