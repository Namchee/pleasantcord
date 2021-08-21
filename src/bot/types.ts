import { Awaited, ClientEvents, Message } from 'discord.js';
import { BotRepository } from '../repository/bot';

export interface BotContext {
  repository: BotRepository;
}

export interface EventHandler {
  event: keyof ClientEvents;
  once?: boolean;
  fn: (ctx: BotContext) => Awaited<void>;
}

export interface CommandHandler {
  command: string;
  description: string;
  fn: (
    ctx: BotContext,
    msg: Message,
  ) => Awaited<void>;
}
