import { init, captureException, close } from '@sentry/node';

/**
 * Error logger.
 * Catch all unexpected errors and report them to error
 * reporting system.
 */
export class Logger {
  // singleton instance
  private static instance: Logger;

  private constructor(dsn: string) {
    init({
      dsn,
      sampleRate: 0.75,
      environment: process.env.NODE_ENV === 'development' ?
        'development' :
        'production',
    });
  }

  /**
   * Get the singleton instance of the logger.
   *
   * @returns {Logger} logger instance
   */
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

  /**
   * Capture all errors and send it to Sentry.
   *
   * @param {Error} err error object
   */
  private captureError(err: Error): void {
    if (process.env.NODE_ENV !== 'production') {
      // note to self: stop removing stacktraces!
      console.error(err);
    }

    captureException(err);
  }

  /**
   * Log errors which is thrown by the bot and report them
   * to error reporting system.
   *
   * @param {Error} err error object.
   */
  public logBot(err: Error): void {
    err.message = `[bot]: ${err.message}`;

    this.captureError(err);
  }

  /**
   * Close the error reporter gracefully.
   */
  public async closeLogger(): Promise<void> {
    await close();
  }
}
