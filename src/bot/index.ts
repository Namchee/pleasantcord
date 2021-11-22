import { Client, Intents } from 'discord.js';
import { NSFWJS } from 'nsfwjs';
import { FunctionThread, Pool } from 'threads';
import { Category } from '../entity/content';

import { ConfigurationService } from '../service/config';
import { RateLimiter } from '../service/rate-limit';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

/**
 * Bootstrap the bot client with all dependencies and
 * events.
 *
 * @param {NSFWJS} model NSFW model
 * @param {ConfigurationRepository} configRepository configuration
 * repository.
 * @returns {Promise<Client>} bootstraped client which is ready
 * to listen and respond to events.
 */
export async function bootstrapBot(
  model: NSFWJS,
  service: ConfigurationService,
  rateLimiter: RateLimiter,
  pool: Pool<FunctionThread<[NSFWJS, string, 'gif' | 'image'], Category[]> >,
): Promise<Client> {
  const client = new Client({
    // weirdly, both are required.
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
  });

  const context: BotContext = {
    client,
    model,
    service,
    rateLimiter,
    workers: pool,
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
