import { Client } from 'discord.js';

import { BotContext, EventHandler } from './bot/types';
import { getDBConnection } from './config/db';
import { MongoRepository } from './repository/mongo';
import { getEvents } from './bot/utils';
import { NSFWClassifier } from './service/nsfw.classifier';

import config from './config/env';

const { env, bot } = config;

(async (): Promise<void> => {
  await NSFWClassifier.initializeCache();

  const discordClient = new Client();
  const dbConnection = await getDBConnection();

  const repository = new MongoRepository(dbConnection);

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

  discordClient.login(env.DISCORD_TOKEN);
})();
