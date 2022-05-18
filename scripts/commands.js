// @ts-check
const {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} = require('@discordjs/builders');
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
      new ContextMenuCommandBuilder().setName('Classify Content').setType(3),
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    const result = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_ID),
      {
        body: commands,
      }
    );

    console.log(result);

    console.log('Application commands has been registered successfully');
  } catch (err) {
    console.error(err);
  }
})();
