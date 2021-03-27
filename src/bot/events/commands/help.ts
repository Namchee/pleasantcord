import { BotContext, CommandHandler } from './../../types';
import { Message, MessageEmbed } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

const commands = readdirSync(__dirname);

let commandText = commands.map((command: string) => {
  if (command === 'help.ts') {
    return;
  }

  const file = require(
    resolve(__dirname, command),
  );

  const handler = file.default as CommandHandler;

  return `\`${config.prefix}${handler.command}\` — ${handler.description}`;
}).join('\n');

// Avoid circular dependency
commandText += `\n\`${config.prefix}help\` — Show the help message`;

export default {
  command: 'help',
  description: 'Show the help message',
  fn: (_: BotContext, msg: Message): Promise<Message> => {
    const { channel } = msg;

    return channel.send(
      new MessageEmbed({
        author: {
          name: config.name,
          iconURL: config.imageUrl,
        },
        title: `About ${config.name.toUppercase()}`,
        fields: [
          {
            name: 'Who Am I?',
            // eslint-disable-next-line max-len
            value: `${config.name} is a simple not-safe-for-world (NSFW for short) image moderation Discord bot. ${config.name} is able to detect NSFW contents AND texts from any natively supported attachment images sent by server members. It is built on top of discord.js`,
          },
          {
            name: 'Available Commands',
            value: commandText,
          },
        ],
        color: config.embedColor,
      }),
    );
  },
};
