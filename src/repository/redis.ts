import { Redis } from 'ioredis';
import { BotRepository, Strike } from './../common/types';
import botConfig from './../../config.json';

export class RedisRepository implements BotRepository {
  public constructor(private readonly client: Redis) {}

  public getStrikes = async (): Promise<Strike[]> => {
    const users = await this.client.keys('*');

    const strikes = users.map(async (user: string): Promise<Strike> => {
      const [count, ttl] = await Promise.all([
        await this.client.get(user),
        await this.client.ttl(user),
      ]);

      return {
        id: user,
        count: Number(count),
        expiration: ttl,
      };
    });

    return Promise.all(strikes);
  };

  public getUserStrike = async (id: string): Promise<Strike> => {
    const [warnCount, ttl] = await this.client.multi()
      .get(id)
      .ttl(id)
      .exec();

    return {
      id,
      count: Number(warnCount[1]) || 0,
      expiration: Number(ttl[1]) || -1,
    };
  }

  public addWarn = async (id: string): Promise<boolean> => {
    const { count } = await this.getUserStrike(id);
    const expirationTime = Number(botConfig.warn.refreshPeriod);

    let result: string | null;

    if (expirationTime === -1) {
      result = await this.client.setex(
        id,
        expirationTime,
        count + 1,
      );
    } else {
      result = await this.client.set(
        id,
        count + 1,
      );
    }

    return result === 'OK';
  }

  public clearWarn = async (id: string): Promise<boolean> => {
    const result = await this.client.del(id);

    return result === 1;
  }
}
