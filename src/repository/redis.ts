import { Redis } from 'ioredis';
import { BotRepository, Warning } from './../common/types';
import botConfig from './../../config.json';

export class RedisRepository implements BotRepository {
  public constructor(private readonly client: Redis) {}

  public getWarn = async (id: string): Promise<Warning> => {
    const [warnCount, ttl] = await this.client.multi()
      .get(id)
      .ttl(id)
      .exec();

    return {
      count: Number(warnCount[1]) || 0,
      expiration: Number(ttl[1]) || -1,
    };
  }

  public addWarn = async (id: string): Promise<boolean> => {
    const { count } = await this.getWarn(id);
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
