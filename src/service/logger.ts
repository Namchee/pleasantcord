import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

import pino from 'pino';

export enum LogLevel {
  INFO = 0,
  WARN = 1,
  ERROR = 2,
}

export class Logger {
  private static instance: Logger;

  private constructor(
    private readonly logger: pino.Logger,
  ) { }

  public static bootstrap(): void {
    const logPath = resolve(process.cwd(), 'logs');

    if (!existsSync(logPath)) {
      mkdirSync(logPath);
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      const path = resolve(process.cwd(), 'logs', 'bot.log');
      const dest = pino.destination(path);

      Logger.instance = new Logger(pino(dest));
    }

    return Logger.instance;
  }

  public logCron(msg: string): void {
    this.logger.info(`[cron] ${msg}`);
  }

  public logBot(msg: string, level: LogLevel = LogLevel.ERROR): void {
    msg = `[bot]: ${msg}`;

    switch (level) {
      case LogLevel.INFO: {
        this.logger.info(msg);
        break;
      }
      case LogLevel.WARN: {
        this.logger.warn(msg);
        break;
      }
      case LogLevel.ERROR: {
        this.logger.error(msg);
        break;
      }
    }
  }
}
