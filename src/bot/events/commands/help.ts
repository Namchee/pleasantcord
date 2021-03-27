import { Message, MessageEmbed } from 'discord.js';

import { BotContext } from '../../types';
import { getCommands } from '../../utils';

export default {
  command: 'help',
  description: 'Show the help message',
  fn: ({ config }: BotContext, msg: Message): Promise<Message> => {
    const { channel } = msg;

    const commands = getCommands();

    return channel.send(
      new MessageEmbed({
        author: {
          name: config.name,
          iconURL: config.imageUrl,
        },
        title: `About ${config.name.toUpperCase()}`,
        fields: [
          {
            name: 'Who Am I?',
            // eslint-disable-next-line max-len
            value: `${config.name} is a simple not-safe-for-world (NSFW for short) image moderation Discord bot. ${config.name} is able to detect NSFW contents AND texts from any natively supported attachment images sent by server members. It is built on top of discord.js`,
          },
          {
            name: 'Available Commands',
            value: commands,
          },
          {
            name: 'Contribution',
            value: 'GitHub — https://github.com/Namchee/pleasantcord',
          },
        ],
        color: config.embedColor,
      }),
    );
  },
};
