// Entry point goes here
import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { DiscordEventCallback } from './common/types';
import env from '@/config/env';

const events = readdirSync(
  `${process.cwd()}\\src\\events`,
);

const client = new Client();

events.forEach((filename) => {
  const file = require(
    `${process.cwd()}\\src\\events\\${filename}`,
  );

  const cb = file.default as DiscordEventCallback;

  client.on(cb.event, cb.fn);
});

client.login(env.DISCORD_TOKEN);
