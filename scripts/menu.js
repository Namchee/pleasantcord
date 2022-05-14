// @ts-check
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_ID) {
  throw new Error('Missing token or client id');
}

(async () => {
  try {
    const commands = [
      new ContextMenuCommandBuilder().setName('Classify Content').setType(2),
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    await rest.put(Routes.applicationCommands(process.env.DISCORD_ID), {
      body: commands,
    });

    console.log('Context menu commands has been registered successfully');
  } catch (err) {
    console.error(err);
  }
})();
