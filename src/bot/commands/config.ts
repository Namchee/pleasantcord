import { Message, MessageEmbed } from 'discord.js';

import { BotContext } from '../types';

export default {
  command: 'config',
  description: 'Show configuration for the current server',
  fn: async (
    { configRepository }: BotContext,
    msg: Message,
  ): Promise<Message> => {
    const { channel, guild } = msg;

    const config = await configRepository.getConfig(guild?.id as string);

    if (!config) {
      throw new Error(
        // eslint-disable-next-line max-len
        `Data synchronization failure: Configuration doesn't exists for ${msg.guild?.name}`,
      );
    }

    const embed = new MessageEmbed({
      author: {
        name: 'pleasantcord',
        iconURL: process.env.IMAGE_URL,
      },
      title: 'Server Configuration',
      fields: [
        {
          name: 'Threshold',
          value: `${(config?.accuracy * 100).toFixed(2)}%`,
        },
        {
          name: 'NSFW Categories',
          value: config.categories.join('\n'),
        },
        {
          name: 'Delete NSFW Contents',
          value: config.delete ? 'Yes' : 'No',
        },
      ],
      color: process.env.NODE_ENV === 'development' ?
        '#2674C2' :
        '#FF9B05',
    });

    return channel.send({ embeds: [embed] });
  },
};
