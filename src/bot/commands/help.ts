import { EmbedBuilder } from 'discord.js';

import { getCommands } from '../utils.js';

import { BLUE, ORANGE } from '../../constants/color.js';

export default {
  command: 'help',
  description: 'Show the help message',
  type: 'CHAT_INPUT',
  fn: async (): Promise<EmbedBuilder[]> => {
    const rawCommands = await getCommands();
    const commands = Object.keys(rawCommands)
      .map((name: string) => {
        const command = rawCommands[name];

        if (command.type === 'MESSAGE') {
          return '';
        }

        return `\`pc!${command.command}\` — ${command.description}`;
      })
      .filter(Boolean);

    return [
      new EmbedBuilder({
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
            name: 'Configuration',
            value: `You can configure \`pleasantcord\`'s behavior on your server from [our dashboard](https://pleasantcord.namchee.dev)`,
          },
          {
            name: 'Issues?',
            value:
              'Feel free to join our support server by clicking [here](https://discord.gg/Pj4aGp8Aky)',
          },
          {
            name: 'Contribution',
            value: `You can contribute to \`pleasantcord\`'s development on [GitHub](https://github.com/Namchee/pleasantcord)`,
          },
        ],
        color: process.env.NODE_ENV === 'development' ? BLUE : ORANGE,
      }),
    ];
  },
};
