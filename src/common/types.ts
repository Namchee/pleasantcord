import { Message, Client } from 'discord.js';

export interface SFWVerdict {
  isSFW: boolean;
  confidence?: number;
}

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
  fn: CommandFunction;
}

export interface Warning {
  count: number;
  expiration: number;
}

export interface BotRepository {
  getWarn: (id: string) => Promise<Warning>;
  addWarn: (id: string) => Promise<boolean>;
  clearWarn: (id: string) => Promise<boolean>;
}
