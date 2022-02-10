import { Message, MessageEmbed } from 'discord.js';

import { RED } from '../../constants/color';
import { PREFIX } from '../../constants/command';

import {
  handleError,
  getCommands,
  getCommand,
  moderateContent,
} from '../utils';

import { CommandHandler, BotContext, CommandHandlerFunction } from '../types';

/**
 * Get all available commands from command files and
 * register all commands to a simple object map.
 */
const commandMap: Record<string, CommandHandlerFunction> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

export default {
  event: 'messageCreate',
  fn: async (
    ctx: BotContext,
    msg: Message
  ): Promise<Message<boolean> | void> => {
    try {
      if (!msg.guild || !msg.channel.isText() || msg.author.bot) {
        return;
      }

      if (msg.content.startsWith(PREFIX)) {
        const commandHandler = commandMap[getCommand(msg.content)];

        if (commandHandler) {
          return commandHandler(ctx, msg);
        }

        const unknownEmbed = new MessageEmbed({
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

        return msg.channel.send({ embeds: [unknownEmbed] });
      }

      return moderateContent(ctx, msg);
    } catch (err) {
      const errorEmbed = handleError(err as Error);

      if (errorEmbed) {
        return msg.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};
