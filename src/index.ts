import { config } from 'dotenv';
import Discord, { Intents } from 'discord.js';

/*
import { Logger } from './utils/logger';
import { bootstrapBot } from './bot';
import { NSFWClassifier } from './utils/nsfw.classifier';
import { Client } from 'faunadb';
import { FaunaConfigurationRepository } from './repository/config';
*/

if (process.env.NODE_ENV === 'development') {
  config();
}

(async (): Promise<void> => {
  /*
  const classifier = await NSFWClassifier.newClassifier();
  const secret = process.env.DB_SECRET;

  if (!secret) {
    throw new Error(
      'Failed to initialize DB connection: secret does not exist',
    );
  }

  const dbClient = new Client({
    secret,
    domain: process.env.DB_HOST,
  });
  const configRepository = new FaunaConfigurationRepository(dbClient);
*/
  // const client = await bootstrapBot(classifier, configRepository);
  const client = new Discord.Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
  });
  /*
  const cleanup = async (): Promise<void> => {
    client.destroy();
    await Promise.all([
      dbClient.close(),
      Logger.getInstance().closeLogger(),
    ]);
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

  */

  client.on('messageCreate', async (msg) => {
    if (!msg.author.bot) {
      msg.reply(client.ws.ping.toString());
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
})();
