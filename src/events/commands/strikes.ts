import { BotContext, Strike } from '@/common/types';
import { resolve } from 'path';
import { Message, MessageEmbed } from 'discord.js';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export default {
  command: 'strikes',
  description: 'Get all active strikes on the current server',
  fn: async ({ repository }: BotContext, msg: Message): Promise<Message> => {
    const { guild } = msg;

    const strikes = await repository.getStrikes();

    let contents = '';

    if (!strikes.length) {
      // eslint-disable-next-line max-len
      contents += '\nNone! Everyone in this server is posting safe contents!';
    } else {
      strikes.forEach((strike: Strike) => {
        const { id, count } = strike;

        // eslint-disable-next-line max-len
        contents += `\n**${guild?.members.cache.get(id)}** — ${count} strikes`;
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
