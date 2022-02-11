import { resolve } from 'path';
import { Message, MessageEmbed } from 'discord.js';

import { BotContext } from '../types';
import { BLUE, ORANGE } from '../../constants/color';

const packageInfo = require(resolve(process.cwd(), 'package.json'));

export default {
  command: 'status',
  description: 'Show the bot status',
  fn: async ({ client }: BotContext, msg: Message): Promise<Message> => {
    const time = Date.now() - msg.createdTimestamp;

    let packageVersion: string = packageInfo.dependencies['discord.js'];

    if (/^[^\d]/.test(packageVersion)) {
      packageVersion = packageVersion.slice(1);
      packageVersion = `v${packageVersion}`;
    }

    const fields = [
      {
        name: 'Bot Environment',
        // eslint-disable-next-line max-len
        value: `**NodeJS Version**: ${process.version.slice(
          1
        )}\n**Framework**: DiscordJS ${packageVersion}`,
      },
      {
        name: 'Active Servers',
        value: `${client.guilds.cache.size} servers`,
        inline: true,
      },
      {
        name: 'Response Time',
        value: `~${time} ms`,
        inline: true,
      },
    ];

    const embed: MessageEmbed = new MessageEmbed({
      author: {
        name: 'pleasantcord',
        iconURL: process.env.IMAGE_URL,
      },
      title: 'Status Report',
      fields,
      color: process.env.NODE_ENV === 'development' ? BLUE : ORANGE,
    });

    return msg.channel.send({ embeds: [embed] });
  },
};
