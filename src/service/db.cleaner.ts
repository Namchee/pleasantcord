import { Logger } from './logger';
import { BotRepository } from './../repository/bot';

export async function cleanDb(repository: BotRepository): Promise<void> {
  const { deletedCount, date } = await repository.clean();

  // eslint-disable-next-line max-len
  const report = `Successfully deleted ${deletedCount} obsolete strike(s) on ${date.toISOString()}`;
  Logger.getInstance().logCron(report);
}
