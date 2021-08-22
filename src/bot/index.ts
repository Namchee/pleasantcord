import { Client, Intents } from 'discord.js';
import { NSFWClassifier } from '../utils/nsfw.classifier';
import { BotContext, EventHandler } from './types';
import { getEvents } from './utils';

export async function bootstrapBot(): Promise<Client> {
  const client = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
  });

  const classifier = await NSFWClassifier.newClassifier();

  const context: BotContext = { classifier };

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
