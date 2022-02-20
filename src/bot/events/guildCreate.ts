import { Guild, MessageEmbed, TextChannel } from 'discord.js';

import { BASE_CONFIG } from './../../entity/config';
import { handleError } from './../utils';

import type { BotContext } from './../types';
import { Credentials, registerSlashCommands } from '../service/command';

export default {
  event: 'guildCreate',
  fn: async ({ client, service }: BotContext, guild: Guild): Promise<void> => {
    try {
      // create guild config when the bot enters a guild.
      await service.createConfig(guild.id, BASE_CONFIG);
      // register slash commands for the new guild
      const creds: Credentials = {
        clientID: client.application?.id as string,
        token: client.token as string,
      };

      return registerSlashCommands(guild.id, creds);
    } catch (err) {
      const embed = handleError(err as Error) as MessageEmbed;

      const defaultChannel = guild.channels.cache.find(
        chan => chan.name.toLowerCase() === 'general'
      ) as TextChannel;

      await defaultChannel.send({ embeds: [embed] });
    }
  },
};
