import { Message, MessageEmbed } from 'discord.js';

import { BotContext, CommandHandler } from '../types';
import { getCommands } from '../utils';

export default {
  command: 'help',
  description: 'Show the help message',
  fn: (_: BotContext, msg: Message): Promise<Message> => {
    const { channel } = msg;

    const rawCommands = getCommands();
    const commands = rawCommands.map((command: CommandHandler) => {
      return `\`pc!${command.command}\` — ${command.description}`;
    });

    const embed = new MessageEmbed({
      author: {
        name: 'pleasantcord',
        iconURL: process.env.IMAGE_URL,
      },
      title: `About \`pleasantcord\``,
      fields: [
        {
          name: 'Who Am I?',
          // eslint-disable-next-line max-len
          value: `\`pleasantcord\` is a simple not-safe-for-work (NSFW for short) image auto-moderation Discord bot. \`pleasantcord\` is able to detect NSFW contents from natively supported attachment images sent by server members. \`pleasantcord\` is powered by discord.js`,
        },
        {
          name: 'Available Commands',
          value: commands.join('\n'),
        },
        {
          name: 'Contribution',
          value: `Contribute to \`pleasantcord\`'s development on [GitHub](https://github.com/Namchee/pleasantcord)`,
        },
      ],
      color: process.env.NODE_ENV === 'development' ?
        '#2674C2' :
        '#FFA31A',
    });

    return channel.send({ embeds: [embed] });
  },
};
