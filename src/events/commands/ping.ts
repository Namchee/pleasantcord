import { Message, MessageEmbed } from 'discord.js';
import { resolve } from 'path';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export default {
  command: 'ping',
  fn: async (msg: Message): Promise<Message> => {
    const time = new Date().getTime() - msg.createdTimestamp;

    const responseMessage: MessageEmbed = new MessageEmbed({
      author: {
        name: config.name,
        iconURL: config.imageUrl,
      },
      title: `[${config.name}] Status Report`,
      fields: [
        {
          name: 'Ping',
          value: `${time} ms`,
          inline: false,
        },
      ],
      hexColor: config.embedColor,
    });

    return msg.channel.send(responseMessage);
  },
};
