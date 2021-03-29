import { Collection, Db } from 'mongodb';
import { DBException } from '../exceptions/db';
import { Strike, StrikeDocument } from '../models/strike';
import { BotRepository } from './bot';

export class MongoRepository implements BotRepository {
  public constructor(
    public readonly db: Db,
  ) { }

  private get collection(): Collection<StrikeDocument> {
    return this.db.collection<StrikeDocument>('strikes');
  }

  public async getStrikes(serverId: string): Promise<Strike[]> {
    const documents = await this.collection
      .find({ serverId })
      .project({ userId: 1, lastUpdated: 1, count: 1, deleted: 1 })
      .toArray();

    return documents.map(doc => Strike.fromDocument(doc));
  }

  public async getStrike(
    serverId: string,
    userId: string,
  ): Promise<Strike | null> {
    const document = await this.collection
      .findOne({ serverId, userId, deleted: false });

    return document ?
      Strike.fromDocument(document) :
      null;
  }

  public async addStrike(
    serverId: string,
    userId: string,
    date: Date,
  ): Promise<Strike> {
    try {
      const strike = await this.getStrike(serverId, userId);

      if (!strike) {
        const newStrike = new Strike(
          serverId,
          userId,
          1,
          date,
          false,
        );

        const insertResult = await this.collection
          .insertOne(newStrike);

        return Strike.fromDocument(insertResult.ops[0]);
      } else {
        const updatedStrike = await this.collection
          .findOneAndUpdate(
            { serverId, userId, deleted: false },
            {
              $inc: { count: 1 },
              $set: { lastUpdated: date, deleted: false },
            },
            { returnOriginal: false },
          );

        return Strike.fromDocument(updatedStrike.value as StrikeDocument);
      }
    } catch (err) {
      const { message } = err as Error;

      throw new DBException(message);
    }
  }

  public async clearStrike(serverId: string, userId: string): Promise<boolean> {
    try {
      const flaggingResult = await this.collection
        .findOneAndUpdate(
          { serverId, userId, deleted: false },
          { $set: { deleted: true } },
        );

      return flaggingResult.ok === 1;
    } catch (err) {
      const { message } = err as Error;

      throw new DBException(message);
    }
  }
}
