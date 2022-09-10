import { Client, GatewayIntentBits } from 'discord.js';

import { ConfigurationService } from '../service/config';
import { RateLimiter } from '../service/rate-limit';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

/**
 * Bootstrap the bot client with all dependencies and
 * events.
 *
 * @param {ConfigurationService} service configuration service
 * @param {RateLimiter} rateLimiter rate limiter
 * @returns {Promise<Client>} bootstraped client which is ready
 * to listen and respond to events.
 */
export async function bootstrapBot(
  service: ConfigurationService,
  rateLimiter: RateLimiter
): Promise<Client> {
  const client = new Client({
    intents: [
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
  });

  const context: BotContext = {
    client,
    service,
    rateLimiter,
  };

  const eventHandlers = await getEvents();

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
