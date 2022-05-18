import { MessageEmbed } from 'discord.js';

import { RED } from './color';
import { PREFIX } from './command';

export const UNKNOWN_COMMAND_EMBED = new MessageEmbed({
  author: {
    name: 'pleasantcord',
    iconURL: process.env.IMAGE_URL,
  },
  color: RED,
  title: 'Unknown Command',
  description:
    // eslint-disable-next-line max-len
    `**pleasantcord** doesn't recognize the command that have been just sent.\nPlease refer to **${PREFIX}help** to show all available **pleasantcords's** commands.`,
});

export const EMPTY_EMBED = new MessageEmbed({
  author: {
    name: 'pleasantcord',
    iconURL: process.env.IMAGE_URL,
  },
  color: RED,
  title: 'Empty Content',
  description:
    // eslint-disable-next-line max-len
    `**pleasantcord** doesn't detect any identifiable content in this message.`,
});
