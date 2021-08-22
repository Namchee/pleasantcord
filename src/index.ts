import { config } from 'dotenv';

import { Logger } from './utils/logger';
import { bootstrapBot } from './bot';

if (process.env.NODE_ENV === 'development') {
  config();
}

(async (): Promise<void> => {
  const client = await bootstrapBot();
  const cleanup = async (): Promise<void> => {
    client.destroy();
    await Logger.getInstance().closeLogger();
  };

  process.on('uncaughtException', async (err) => {
    Logger.getInstance().logBot(`Uncaught Exception: ${err}`);
    await cleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    Logger.getInstance().logBot(`Unhandled promise rejection: ${reason}`);
    await cleanup();
    process.exit(1);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGKILL', async () => {
    await cleanup();
    process.exit(0);
  });

  await client.login(process.env.DISCORD_TOKEN);
})();
