import { Client } from 'discord.js';
import { schedule } from 'node-cron';

import { BotContext, EventHandler } from './bot/types';
import { getDB } from './config/db';
import { MongoRepository } from './repository/mongo';
import { getEvents } from './bot/utils';
import { Logger } from './service/logger';
import { NSFWClassifier } from './service/nsfw.classifier';

import config from './config/env';
import { cleanDb } from './service/db.cleaner';

const { env, bot } = config;

(async (): Promise<void> => {
  await NSFWClassifier.initializeCache();

  const discordClient = new Client();
  const db = await getDB();

  const repository = new MongoRepository(db);

  const context: BotContext = {
    client: discordClient,
    config: bot,
    repository,
  };

  const eventHandlers = getEvents();

  eventHandlers.forEach(({ event, once, fn }: EventHandler) => {
    const handler = fn.bind(null, context);

    if (once) {
      discordClient.once(event, handler);
    } else {
      discordClient.on(event, handler);
    }
  });

  Logger.bootstrap();

  schedule('0 0 1 * *', async () => {
    await cleanDb(repository);
  });

  discordClient.login(env.DISCORD_TOKEN);
})();
