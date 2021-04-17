import { Client, Message } from 'discord.js';
import { BotRepository } from '../repository/bot';

export interface BotConfig {
  name: string;
  imageUrl: string;
  prefix: string;
  confidence: number;
  deleteNSFW: boolean;
  embedColor: string;
  strike: {
    count: number;
    refreshPeriod: number;
  };
  modLog: {
    category: string;
    channel: string;
  };
  ban: boolean;
}

export interface BotContext {
  client: Client;
  config: BotConfig;
  repository: BotRepository;
}

export interface EventHandler {
  event: string;
  once?: boolean;
  fn: (ctx: BotContext) => Promise<Message | void>;
}

export interface CommandHandler {
  command: string;
  description: string;
  fn: (
    ctx: BotContext,
    msg: Message,
  ) => Promise<Message | void>;
}
