import { config } from 'dotenv';

import NodeCache from 'node-cache';

import { bootstrapBot } from './bot';

import { ConfigurationService } from './service/config';
import { LocalRateLimiter } from './service/rate-limit';

import {
  CloudflareConfigurationRepository,
  LocalConfigurationCache,
} from './repository/config';

import { Logger } from './utils/logger';

import { FIVE_MINUTES, THREE_SECONDS } from './constants/time';

if (process.env.NODE_ENV === 'development') {
  config();
}

(async (): Promise<void> => {
  const apiKey = process.env.API_KEY;
  const apiUrl = process.env.API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('Missing API information. Please check the configuration');
  }

  const configCache = new NodeCache({
    stdTTL: FIVE_MINUTES,
    checkperiod: FIVE_MINUTES,
  });
  const rateLimitStore = new NodeCache({
    stdTTL: THREE_SECONDS,
    checkperiod: THREE_SECONDS,
  });

  const repository = new CloudflareConfigurationRepository(
    `${apiUrl}/api`,
    apiKey
  );
  const cache = new LocalConfigurationCache(configCache);
  const rateLimiter = new LocalRateLimiter(rateLimitStore);

  const service = new ConfigurationService(cache, repository);

  const client = await bootstrapBot(service, rateLimiter);

  const cleanup = async (): Promise<void> => {
    client.destroy();
    await Logger.getInstance().closeLogger();
  };

  process.on('uncaughtException', async err => {
    Logger.getInstance().logBot(err);
    await cleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async reason => {
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
