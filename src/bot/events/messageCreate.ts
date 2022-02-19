import { Message, MessageEmbed, TextChannel } from 'discord.js';

import { PREFIX } from '../../constants/command';

import {
  handleError,
  getCommands,
  getCommand,
  moderateContent,
} from '../utils';

import {
  CommandHandler,
  BotContext,
  CommandHandlerFunction,
  CommandHandlerParams,
} from '../types';
import { UNKNOWN_COMMAND_EMBED } from '@/constants/embeds';

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
        let embed: MessageEmbed = UNKNOWN_COMMAND_EMBED;

        if (commandHandler) {
          const params: CommandHandlerParams = {
            guild: msg.guild,
            channel: msg.channel as TextChannel,
            timestamp: msg.createdTimestamp,
          };
          embed = await commandHandler(ctx, params);
        }

        return msg.channel.send({ embeds: [embed] });
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
