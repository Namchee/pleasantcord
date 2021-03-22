import { Message, MessageEmbed } from 'discord.js';
import { resolve } from 'path';
import { DateTime } from 'luxon';
import { BotContext } from '../../common/types';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export default {
  command: 'strike',
  description: 'Get the sender strike count on the current server',
  fn: async ({ repository }: BotContext, msg: Message): Promise<Message> => {
    const { author } = msg;

    const { count, expiration } = await repository.getUserStrike(author.id);

    let expirationTime = '-';

    if (expiration > -1) {
      expirationTime = DateTime.local()
        .plus({ seconds: expiration })
        .toRelative() as string;
    }

    const fields = [
      {
        name: 'Member',
        value: author.toString(),
      },
      {
        name: 'Current Strikes',
        value: count,
      },
      {
        name: 'Expiration Time',
        value: expirationTime,
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
