import { Message } from 'discord.js';

export interface SFWVerdict {
  isSFW: boolean;
  confidence?: number;
}

export interface DiscordEventCallback {
  event: string;
  fn: () => Promise<Message | void>;
}
