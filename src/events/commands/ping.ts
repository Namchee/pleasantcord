import { BotContext } from '@/common/types';
import { Message, MessageEmbed } from 'discord.js';
import { resolve } from 'path';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export default {
  command: 'ping',
  fn: async (_: BotContext, msg: Message): Promise<Message> => {
    const time = new Date().getTime() - msg.createdTimestamp;

    const responseMessage: MessageEmbed = new MessageEmbed({
      author: {
        name: config.name,
        iconURL: config.imageUrl,
      },
      title: 'Status Report',
      fields: [
        {
          name: 'Response Time',
          value: `${time} ms`,
          inline: false,
        },
      ],
      color: config.embedColor,
    });

    return msg.channel.send(responseMessage);
  },
};
