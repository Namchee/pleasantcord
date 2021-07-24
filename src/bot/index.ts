import { Client } from 'discord.js';
import { BotRepository } from '../repository/bot';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

import config from './../config/env';

export function bootstrapBot(repository: BotRepository): Client {
  const discordClient = new Client();

  const context: BotContext = {
    client: discordClient,
    config: config.bot,
    repository,
  };

  const eventHandlers = getEvents();

  eventHandlers.forEach(({ event, once, fn }: EventHandler) => {
    const handler = fn.bind(null, context);

    if (once) {
      discordClient.once(event, handler);
    } else {
      discordClient.on(event, handler);
    }
  });

  return discordClient;
}
