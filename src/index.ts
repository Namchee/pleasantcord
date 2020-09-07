// Entry point goes here
import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { DiscordEventCallback } from './common/types';
import env from './config/env';

const path = process.env.NODE_ENV === 'production' ?
  'dist' :
  'src';

const events = readdirSync(
  `${process.cwd()}\\${path}\\events`,
);

const client = new Client();

events.forEach((filename) => {
  if (/\.(spec|test)\./.test(filename)) {
    return;
  }

  const file = require(
    `${process.cwd()}\\${path}\\events\\${filename}`,
  );

  const cb = file.default as DiscordEventCallback;

  client.on(cb.event, cb.fn);
});

client.login(env.DISCORD_TOKEN);
