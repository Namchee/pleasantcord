import { Message, MessageEmbed, TextChannel } from 'discord.js';

import {
  handleError,
  getMessageCommand,
  moderateContent,
  getCommandMap,
} from '../utils';

import { BotContext, CommandHandlerParams } from '../types';

import { PREFIX } from '../../constants/command';
import { UNKNOWN_COMMAND_EMBED } from '../../constants/embeds';

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
        const commandMap = getCommandMap();
        const handler = commandMap[getMessageCommand(msg.content)];
        let embed: MessageEmbed = UNKNOWN_COMMAND_EMBED;

        if (handler) {
          const params: CommandHandlerParams = {
            guild: msg.guild,
            channel: msg.channel as TextChannel,
            timestamp: msg.createdTimestamp,
          };
          embed = await handler(ctx, params);
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
