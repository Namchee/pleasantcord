import { Awaited, Client, ClientEvents, Message } from 'discord.js';
import { ConfigurationRepository } from '../repository/config';
import { NSFWClassifier } from '../utils/nsfw.classifier';

export interface BotContext {
  client: Client;
  classifier: NSFWClassifier;
  configRepository: ConfigurationRepository;
}

export interface EventHandler {
  event: keyof ClientEvents;
  once?: boolean;
  fn: (ctx: BotContext) => Awaited<void>;
}

export type CommandHandlerFunction = (
  ctx: BotContext,
  msg: Message,
) => Awaited<void>;

export interface CommandHandler {
  command: string;
  description: string;
  fn: CommandHandlerFunction;
}
