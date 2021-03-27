import { Message, MessageEmbed } from 'discord.js';

import { BotContext } from '../../types';

export default {
  command: 'status',
  description: 'Show the bot status',
  fn: async ({ config }: BotContext, msg: Message): Promise<Message> => {
    const time = new Date().getTime() - msg.createdTimestamp;

    const fields = [
      {
        name: 'Response Time',
        value: `${time} ms`,
        inline: true,
      },
    ];

    const responseMessage: MessageEmbed = new MessageEmbed({
      author: {
        name: config.name,
        iconURL: config.imageUrl,
      },
      title: 'Status Report',
      fields,
      color: config.embedColor,
    });

    return msg.channel.send(responseMessage);
  },
};
