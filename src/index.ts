import { schedule } from 'node-cron';

import { getDBConnection } from './config/db';
import { MongoRepository } from './repository/mongo';
import { Logger, LogLevel } from './service/logger';
import { NSFWClassifier } from './service/nsfw.classifier';

import config from './config/env';
import { cleanDb } from './service/db.cleaner';
import { bootstrapBot } from './bot';

const { env } = config;

(async (): Promise<void> => {
  try {
    await NSFWClassifier.initializeCache();

    const connection = await getDBConnection();
    const db = connection.db(env.MONGO_DBNAME);
    const repository = new MongoRepository(db);

    const discordClient = bootstrapBot(repository);

    Logger.bootstrap();

    schedule('0 0 1 * *', async () => {
      await cleanDb(repository);
    });

    discordClient.login(env.DISCORD_TOKEN);

    const closeConnections = async (): Promise<void> => {
      await connection.close();
      discordClient.destroy();
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
