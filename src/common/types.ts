import { Message, Client } from 'discord.js';

export interface SFWVerdict {
  isSFW: boolean;
  confidence?: number;
}

export interface DiscordEventCallback {
  event: string;
  once?: boolean;
  fn: (client: Client) => Promise<Message | void>;
}
