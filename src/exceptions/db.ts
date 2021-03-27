export class DBException extends Error {
  constructor(message: string) {
    super(
      `Database operation failed${message ? `: ${message}` : ''}`,
    );
  }
}
