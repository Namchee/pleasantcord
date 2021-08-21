import { Client, Intents } from 'discord.js';
import { BotRepository } from '../repository/bot';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

export function bootstrapBot(repository: BotRepository): Client {
  const client = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES],
  });

  const context: BotContext = {
    repository,
  };

  const eventHandlers = getEvents();

  eventHandlers.forEach(({ event, once, fn }: EventHandler) => {
    const handler = fn.bind(null, context);

    if (once) {
      client.once(event, handler);
    } else {
      client.on(event, handler);
    }
  });

  return client;
}
