// @ts-check
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_ID) {
  throw new Error('Missing token or client id');
}

(async () => {
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
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_ID,
        '871723788599980084'
      ),
      {
        body: commands,
      }
    );

    console.log('Command has been registered successfully');
  } catch (err) {
    console.error(err);
  }
})();
