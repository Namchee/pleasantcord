import { Client, Message } from 'discord.js';
import { BotRepository } from '../repository/bot';

export interface BotContext {
  client: Client;
  repository: BotRepository;
}

export interface EventHandler {
  event: string;
  once?: boolean;
  fn: (ctx: BotContext) => Promise<Message | void>;
}

export type CommandFunction = (
  ctx: BotContext,
  msg: Message,
) => Promise<Message | void>;

export interface CommandHandler {
  command: string;
  description: string;
  fn: CommandFunction;
}
