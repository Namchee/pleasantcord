import { Interaction, MessageEmbed, TextChannel } from 'discord.js';

import { UNKNOWN_COMMAND_EMBED } from './../../constants/embeds';
import { BotContext, CommandHandlerParams } from '../types';

import { getCommandMap } from '../utils';

export default {
  event: 'interactionCreate',
  fn: async (ctx: BotContext, interaction: Interaction) => {
    if (
      !interaction.isCommand() ||
      !interaction.guild ||
      !interaction.channel?.isText()
    ) {
      return;
    }

    const commandMap = getCommandMap();
    const handler = commandMap[interaction.commandName];

    let embed: MessageEmbed = UNKNOWN_COMMAND_EMBED;

    if (handler) {
      const params: CommandHandlerParams = {
        guild: interaction.guild,
        channel: interaction.channel as TextChannel,
        timestamp: interaction.createdTimestamp,
      };
      embed = await handler(ctx, params);
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
