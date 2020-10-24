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

    const result = await this.client.setex(
      id,
      Number(botConfig.warn.refreshPeriod),
      count + 1,
    );

    return result === 'OK';
  }

  public clearWarn = async (id: string): Promise<boolean> => {
    const result = await this.client.del(id);

    return result === 1;
  }
}
