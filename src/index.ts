import { config } from 'dotenv';

import { Logger } from './utils/logger';
import { bootstrapBot } from './bot';
import { NSFWClassifier } from './utils/nsfw.classifier';
import { CloudflareConfigurationRepository } from './repository/config';

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

  const configRepo = new CloudflareConfigurationRepository(
    `${apiUrl}/api`,
    apiKey,
  );

  const client = await bootstrapBot(classifier, configRepo);

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
