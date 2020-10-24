import { Message, MessageEmbed } from 'discord.js';
import { DateTime } from 'luxon';
import { BotContext } from '../../common/types';
import config from '../../../config.json';

export default {
  command: 'warnings',
  fn: async ({ repository }: BotContext, msg: Message): Promise<Message> => {
    const { author } = msg;

    const { count, expiration } = await repository.getWarn(author.id);

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
        name: 'Warnings',
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
          icon_url: config.imageUrl,
        },
        title: `[INFO] ${config.name}'s warning report`,
        color: '#03A9F4',
        fields,
      }),
    );
  },
};
