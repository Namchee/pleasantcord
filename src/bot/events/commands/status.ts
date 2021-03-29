import { Message, MessageEmbed } from 'discord.js';
import { resolve } from 'path';

import { BotContext } from '../../types';

const packageInfo = require(
  resolve(process.cwd(), 'package.json'),
);

export default {
  command: 'status',
  description: 'Show the bot status',
  fn: async ({ config }: BotContext, msg: Message): Promise<Message> => {
    const time = new Date().getTime() - msg.createdTimestamp;

    let packageVersion: string = packageInfo.dependencies['discord.js'];

    if (/^[^\d]/.test(packageVersion)) {
      packageVersion = packageVersion.slice(1);
      packageVersion = `v${packageVersion}`;
    }

    const fields = [
      {
        name: 'Bot Environment',
        // eslint-disable-next-line max-len
        value: `**NodeJS Version**: ${process.version.slice(1)}\n**Framework**: DiscordJS ${packageVersion}`,
      },
      {
        name: 'Response Time',
        value: `~${time} ms`,
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
