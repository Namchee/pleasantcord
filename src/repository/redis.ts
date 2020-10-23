import { Redis } from 'ioredis';
import { BotRepository } from './../common/types';
import botConfig from './../../config.json';

export class RedisRepository implements BotRepository {
  public constructor(private readonly client: Redis) {}

  public getWarn = async (id: string): Promise<number> => {
    const warnCount = await this.client.get(id);

    return Number(warnCount) || 0;
  }

  public addWarn = async (id: string): Promise<boolean> => {
    const prevWarn = await this.getWarn(id);

    const result = await this.client.setex(
      id,
      Number(botConfig.warn.refreshPeriod),
      prevWarn + 1,
    );

    return result === 'OK';
  }

  public clearWarn = async (id: string): Promise<boolean> => {
    const result = await this.client.del(id);

    return result === 1;
  }
}
