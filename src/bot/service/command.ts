import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export interface Credentials {
  clientID: string;
  token: string;
}

/**
 * Register slash commands for a guild
 *
 * @param {string} guildID guild ID
 * @param {Credentials} creds Bot's credentials
 * @param {string} creds.clientID Discord's client ID
 * @param {string} creds.token Discord's bot token
 */
export async function registerSlashCommands(
  guildID: string,
  { clientID, token }: Credentials
): Promise<void> {
  try {
    const commands = [
      new SlashCommandBuilder()
        .setName('config')
        .setDescription("Show pleasantcord's configuration for this guild"),
      new SlashCommandBuilder()
        .setName('status')
        .setDescription("Show pleasantcord's global status"),
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show the help menu of pleasantcord'),
      new ContextMenuCommandBuilder().setName('Classify Content').setType(3),
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '9' }).setToken(token);

    await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
      body: commands,
    });
  } catch (err) {
    const { message } = err as Error;
    throw new Error(`Failed to register slash commands: ${message}`);
  }
}
