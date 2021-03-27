import { Client } from 'discord.js';
import { resolve } from 'path';
import { readdirSync, lstatSync } from 'fs';

import config from './config/env';
import { BotContext, EventHandler } from './bot/types';
import { getDBConnection } from './config/db';
import { MongoRepository } from './repository/mongo';

const { env } = config;

const basePath = resolve(__dirname, 'bot', 'events');
const events = readdirSync(basePath);

(async (): Promise<void> => {
  const discordClient = new Client();
  const dbConnection = await getDBConnection();

  const repository = new MongoRepository(dbConnection);

  const ctx: BotContext = {
    client: discordClient,
    repository,
  };

  events.forEach((filename) => {
    const path = resolve(basePath, filename);

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
})();
