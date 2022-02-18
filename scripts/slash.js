// @ts-check
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_ID) {
  throw new Error('Missing token or client id');
}

(async () => {
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
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(Routes.applicationCommands(process.env.DISCORD_ID), {
    body: commands,
  });

  console.log('Command has been registered successfully');
})();
