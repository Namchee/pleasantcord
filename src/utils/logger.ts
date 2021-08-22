import { init, captureException, close } from '@sentry/node';

export class Logger {
  private static instance: Logger;

  private constructor(dsn: string) {
    init({
      dsn,
      sampleRate: 0.8,
      environment: process.env.NODE_ENV === 'development' ?
        'development' :
        'production',
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      const dsn = process.env.DSN;

      if (!dsn) {
        throw new Error('Failed to initialize logger: DSN is undefined');
      }

      Logger.instance = new Logger(dsn as string);
    }

    return Logger.instance;
  }

  private captureError(msg: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(msg);
    }

    captureException(msg);
  }

  public logBot(msg: string): void {
    msg = `[bot]: ${msg}`;

    this.captureError(msg);
  }

  public async closeLogger(): Promise<void> {
    await close();
  }
}
