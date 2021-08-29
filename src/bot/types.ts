import { Awaited, Client, ClientEvents, Message } from 'discord.js';

import { ConfigurationRepository } from '../repository/config';
import { NSFWClassifier } from '../utils/nsfw.classifier';

// Bot dependency object.
export interface BotContext {
  client: Client;
  classifier: NSFWClassifier;
  configRepository: ConfigurationRepository;
}

// Discord's event handler definition
export interface EventHandler {
  event: keyof ClientEvents;
  once?: boolean;
  fn: (ctx: BotContext) => Awaited<void>;
}

/**
 * Command handler function.
 * Used in `messageCreate` event when the message
 * is prefixed with `pc!` with the correct command.
 */
export type CommandHandlerFunction = (
  ctx: BotContext,
  msg: Message,
) => Awaited<void>;

/**
 * Command handler.
 * Used in `messageCreate` event when the message
 * is prefixed with `pc!`
 */
export interface CommandHandler {
  command: string;
  description: string;
  fn: CommandHandlerFunction;
}
