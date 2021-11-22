import { Client, Intents } from 'discord.js';

import { NSFWClassifier } from '../service/classifier';
import { ConfigurationService } from '../service/config';
import { RateLimiter } from '../service/rate-limit';
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
  service: ConfigurationService,
  rateLimiter: RateLimiter,
): Promise<Client> {
  const client = new Client({
    // weirdly, both are required.
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
  });

  const context: BotContext = {
    client,
    classifier,
    service,
    rateLimiter,
  };
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
