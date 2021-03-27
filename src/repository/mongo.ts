import { Collection, Db } from 'mongodb';
import { DBException } from '../exceptions/db';
import { Strike } from '../models/strike';
import { BotRepository } from './bot';

export class MongoRepository implements BotRepository {
  public constructor(
    public readonly db: Db,
  ) { }

  private get collection(): Collection<Strike> {
    return this.db.collection<Strike>('strikes');
  }

  public async getStrikes(serverId: string): Promise<Strike[]> {
    return this.collection
      .find({ serverId })
      .project({ userId: 1, count: 1 })
      .toArray();
  }

  public async getStrike(
    serverId: string,
    userId: string,
  ): Promise<Strike | null> {
    return this.collection
      .findOne({ serverId, userId });
  }

  public async addStrike(
    serverId: string,
    userId: string,
    date: Date,
  ): Promise<Strike> {
    try {
      const strike = await this.getStrike(serverId, userId);

      if (!strike) {
        const newStrike = await this.collection
          .insertOne({ serverId, userId, count: 1, lastUpdated: date });

        return newStrike.ops[0];
      } else {
        const updatedStrike = await this.collection
          .findOneAndUpdate(
            { serverId, userId },
            {
              $inc: { count: 1 },
              $set: { lastUpdated: new Date() },
            },
            { returnOriginal: false },
          );

        return updatedStrike.value as Strike;
      }
    } catch (err) {
      const { message } = err as Error;

      throw new DBException(message);
    }
  }

  public async clearStrike(serverId: string, userId: string): Promise<boolean> {
    try {
      const deleteResult = await this.collection
        .deleteOne({ serverId, userId });

      return deleteResult.result.ok === 1;
    } catch (err) {
      const { message } = err as Error;

      throw new DBException(message);
    }
  }
}
