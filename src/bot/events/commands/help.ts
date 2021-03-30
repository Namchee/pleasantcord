import { Message, MessageEmbed } from 'discord.js';

import { BotContext, CommandHandler } from '../../types';
import { getCommands } from '../../utils';

export default {
  command: 'help',
  description: 'Show the help message',
  fn: ({ config }: BotContext, msg: Message): Promise<Message> => {
    const { channel } = msg;

    const rawCommands = getCommands();

    const commands = rawCommands.map((command: CommandHandler) => {
      return `\`${config.prefix}${command.command}\` — ${command.description}`;
    });

    return channel.send(
      new MessageEmbed({
        author: {
          name: config.name,
          iconURL: config.imageUrl,
        },
        title: `About ${config.name}`,
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
            value: `Contribute to ${config.name}'s development on [GitHub](https://github.com/Namchee/pleasantcord)`,
          },
        ],
        color: config.embedColor,
      }),
    );
  },
};
