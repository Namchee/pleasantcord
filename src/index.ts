import { config } from 'dotenv';

import { Logger, LogLevel } from './utils/logger';
import { bootstrapBot } from './bot';

if (process.env.NODE_ENV === 'development') {
  config();
}

(async (): Promise<void> => {
  try {
    const client = await bootstrapBot();

    Logger.bootstrap();

    client.login(process.env.DISCORD_TOKEN);

    const closeConnections = async (): Promise<void> => {
      client.destroy();
    };

    process.on('uncaughtException', async (err) => {
      Logger.getInstance().logBot(`Uncaught Exception: ${err}`, LogLevel.ERROR);
      await closeConnections();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
      Logger.getInstance().logBot(
        `Unhandled promise rejection: ${reason}`,
        LogLevel.ERROR,
      );
      await closeConnections();
      process.exit(1);
    });

    process.on('SIGTERM', async () => {
      await closeConnections();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
  }
})();
