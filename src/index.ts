import { config } from 'dotenv';

import NodeCache from 'node-cache';

import { Logger } from './utils/logger';
import { bootstrapBot } from './bot';
import { NSFWClassifier } from './service/classifier';
import {
  CloudflareConfigurationRepository,
  LocalConfigurationCache,
} from './repository/config';
import { FIVE_MINUTES } from './constants/cache';
import { ConfigurationService } from './service/config';

if (process.env.NODE_ENV === 'development') {
  config();
}

(async (): Promise<void> => {
  const classifier = await NSFWClassifier.newClassifier();

  const apiKey = process.env.API_KEY;
  const apiUrl = process.env.API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('Missing API information. Please check the configuration');
  }

  const localCache = new NodeCache({
    stdTTL: FIVE_MINUTES,
    checkperiod: FIVE_MINUTES,
  });

  const repository = new CloudflareConfigurationRepository(
    `${apiUrl}/api`,
    apiKey,
  );
  const cache = new LocalConfigurationCache(localCache);

  const service = new ConfigurationService(cache, repository);

  const client = await bootstrapBot(classifier, service);

  const cleanup = async (): Promise<void> => {
    client.destroy();
    await Logger.getInstance().closeLogger();
  };

  process.on('uncaughtException', async (err) => {
    Logger.getInstance().logBot(err);
    await cleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    Logger.getInstance().logBot(reason as Error);
    await cleanup();
    process.exit(1);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  await client.login(process.env.DISCORD_TOKEN);
})();
