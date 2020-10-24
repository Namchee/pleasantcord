// Entry point goes here
import Redis from 'ioredis';
import { Client } from 'discord.js';
import { resolve } from 'path';
import { readdirSync, lstatSync } from 'fs';
import { RedisRepository } from './repository/redis';
import { BotContext, EventHandler } from './common/types';
import env from './config/env';

const events = readdirSync(resolve(__dirname, 'events'));

const discordClient = new Client();
const redisClient = new Redis(
  Number(env.REDIS_PORT),
  env.REDIS_HOST,
  { password: env.REDIS_PASSWORD },
);
const repository = new RedisRepository(redisClient);
const ctx: BotContext = {
  client: discordClient,
  repository,
};

events.forEach((filename) => {
  const path = resolve(__dirname, 'events', filename);

  if (/\.(spec|test)\./.test(filename) || lstatSync(path).isDirectory()) {
    return;
  }

  const file = require(path);

  const handler = file.default as EventHandler;
  const fn = handler.fn.bind(null, ctx);

  if (handler.once) {
    discordClient.once(handler.event, fn);
  } else {
    discordClient.on(handler.event, fn);
  }
});

discordClient.login(env.DISCORD_TOKEN);
