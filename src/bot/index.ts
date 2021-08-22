import { Client, Intents } from 'discord.js';
import { ConfigurationRepository } from '../repository/config';
import { NSFWClassifier } from '../utils/nsfw.classifier';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

export async function bootstrapBot(
  classifier: NSFWClassifier,
  configRepository: ConfigurationRepository,
): Promise<Client> {
  const client = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
  });

  const context: BotContext = { classifier, configRepository };

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
