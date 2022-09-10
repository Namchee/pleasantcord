import {
  Client,
  ClientEvents,
  Guild,
  Message,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

import { ConfigurationService } from '../service/config.js';
import { RateLimiter } from '../service/rate-limit.js';

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
  fn: (ctx: BotContext) => Promise<void>;
}

// Required parameters for command handlers
export interface CommandHandlerParams {
  guild: Guild;
  channel: TextChannel;
  timestamp: number;
  message?: Message;
}

/**
 * Command handler function.
 * Used in `messageCreate` event when the message
 * is prefixed with `pc!` with the correct command OR
 * on `interactionCreate` with slash commands
 */
export type CommandHandlerFunction = (
  ctx: BotContext,
  params: CommandHandlerParams
) => Promise<EmbedBuilder[]>;

/**
 * Command handler.
 * Used in `messageCreate` event when the message
 * is prefixed with `pc!`
 */
export interface CommandHandler {
  command: string;
  description: string;
  type: 'MESSAGE' | 'CHAT_INPUT';
  fn: CommandHandlerFunction;
}
