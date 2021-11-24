import { Awaited, Client, ClientEvents, Message } from 'discord.js';

import { ConfigurationService } from '../service/config';
import { RateLimiter } from '../service/rate-limit';
import { Category } from '../entity/content';

// Bot dependency object.
export interface BotContext {
  client: Client;
  service: ConfigurationService;
  rateLimiter: RateLimiter;
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

/**
 * Classification result.
 *
 * Returned from classification result from thread
 */
export interface ClassificationResult {
  source: string;
  categories: Category[];
  time?: number;
}
