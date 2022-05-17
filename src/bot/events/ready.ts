import { ApplicationCommandData, Client } from 'discord.js';
import { BotContext } from '../types';
import { getCommands, handleError } from './../utils';

export default {
  event: 'ready',
  once: true,
  fn: async ({ client, service }: BotContext): Promise<void> => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`pleasantcord is now ready to moderate servers`);
    }

    try {
      await initializeCommands(client);
      // set required authentication data
      service.repository.setBotId(client.user?.id as string);

      client.user?.setPresence({
        status: 'online',
        activities: [
          {
            name: 'for NSFW contents 👀',
            type: 'WATCHING',
          },
        ],
      });
    } catch (err) {
      handleError(err as Error);
    }
  },
};

/**
 * Set commands to all guilds.
 *
 * @param {Client} client discord.js client
 * @returns {Promise<any>[]} array of promises for setting guild commands.
 */
function initializeCommands(client: Client): Promise<any>[] {
  const commands = getCommands();
  const guildCommands: ApplicationCommandData[] = Object.keys(commands).map(
    (name: string) => {
      const command = commands[name];

      return {
        name,
        description: command.description,
        type: command.type,
      };
    }
  );

  return client.guilds.cache.map(guild => guild.commands.set(guildCommands));
}
