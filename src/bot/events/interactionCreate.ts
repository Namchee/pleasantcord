import { Interaction, Message, MessageEmbed, TextChannel } from 'discord.js';

import { UNKNOWN_COMMAND_EMBED } from './../../constants/embeds';
import { BotContext, CommandHandlerParams } from '../types';

import { getCommandMap, handleError } from '../utils';

export default {
  event: 'interactionCreate',
  fn: async (ctx: BotContext, interaction: Interaction) => {
    if (
      !interaction.guild ||
      !interaction.channel?.isText() ||
      !(interaction.isCommand() || interaction.isMessageContextMenu())
    ) {
      return;
    }

    let message = undefined;

    if (
      interaction.isMessageContextMenu() &&
      interaction.targetMessage instanceof Message
    ) {
      message = interaction.targetMessage;
    }

    try {
      const commandMap = getCommandMap();
      const handler = commandMap[interaction.commandName];

      let embeds: MessageEmbed[] = [UNKNOWN_COMMAND_EMBED];

      if (handler) {
        const params: CommandHandlerParams = {
          guild: interaction.guild,
          channel: interaction.channel as TextChannel,
          timestamp: interaction.createdTimestamp,
          message,
        };
        embeds = await handler(ctx, params);
      }

      return interaction.reply({ embeds });
    } catch (err) {
      const errorEmbed = handleError(err as Error);

      if (errorEmbed) {
        return interaction.reply({ embeds: [errorEmbed] });
      }
    }
  },
};
