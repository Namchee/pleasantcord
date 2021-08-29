import { Client, Intents } from 'discord.js';
import { ConfigurationRepository } from '../repository/config';
import { NSFWClassifier } from '../utils/nsfw.classifier';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

/**
 * Bootstrap the bot client with all dependencies and
 * events.
 *
 * @param {NSFWClassifier} classifier NSFW classifier instance
 * @param {ConfigurationRepository} configRepository configuration
 * repository.
 * @returns {Promise<Client>} bootstraped client which is ready
 * to listen and respond to events.
 */
export async function bootstrapBot(
  classifier: NSFWClassifier,
  configRepository: ConfigurationRepository,
): Promise<Client> {
  const client = new Client({
    // weirdly, both are required.
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
  });

  const context: BotContext = { client, classifier, configRepository };

  const eventHandlers = getEvents();

  eventHandlers.forEach(({ event, once, fn }: EventHandler) => {
    // dependency injection
    const handler = fn.bind(null, context);

    if (once) {
      client.once(event, handler);
    } else {
      client.on(event, handler);
    }
  });

  return client;
}
