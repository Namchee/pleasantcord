import { Awaited, ClientEvents, Message } from 'discord.js';
import { NSFWClassifier } from '../utils/nsfw.classifier';

export interface BotContext {
  classifier: NSFWClassifier;
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
