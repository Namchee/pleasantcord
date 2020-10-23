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

export interface BotRepository {
  getWarn: (id: string) => Promise<number>;
  addWarn: (id: string) => Promise<boolean>;
  clearWarn: (id: string) => Promise<boolean>;
}
