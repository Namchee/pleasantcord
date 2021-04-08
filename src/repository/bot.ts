import { Strike } from '../models/strike';

export interface MaintenanceReport {
  date: Date;
  deletedCount: number;
}

export interface BotRepository {
  getStrikes: (serverId: string) => Promise<Strike[]>;
  getStrike: (serverId: string, userId: string) => Promise<Strike | null>;
  addStrike: (serverId: string, userId: string, date: Date) => Promise<Strike>;
  clearStrike: (serverId: string, userId: string) => Promise<boolean>;
  clean: () => Promise<MaintenanceReport>;
}
