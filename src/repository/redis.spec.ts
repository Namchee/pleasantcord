import Redis from 'ioredis';
import { RedisRepository } from './redis';
import config from './../../config.json';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
    };
  });
});

describe('Redis Repository', () => {
  let client: Redis.Redis;
  let repository: RedisRepository;

  beforeAll(() => {
    client = new Redis();
    repository = new RedisRepository(client);
  });

  describe('getWarn', () => {
    it('should return number of warnings when key exists', async () => {
      const get = client.get as jest.Mock;
      get.mockImplementation(() => 1);

      const result = await repository.getWarn('test');

      expect(result).toBe(1);
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('test');
    });

    it('should return zero when key doesn\'t exist', async () => {
      const get = client.get as jest.Mock;
      get.mockImplementation(() => null);

      const result = await repository.getWarn('test');

      expect(result).toBe(0);
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('test');
    });
  });

  describe('addWarn', () => {
    it('should return true when warnings have been added', async () => {
      const get = client.get as jest.Mock;
      const setex = client.setex as jest.Mock;

      get.mockImplementation(() => 0);
      setex.mockImplementation(() => 'OK');

      const result = await repository.addWarn('test');

      expect(result).toBe(true);
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('test');
      expect(setex).toHaveBeenCalledTimes(1);
      expect(setex).toHaveBeenLastCalledWith(
        'test',
        config.warn.refreshPeriod,
        1,
      );
    });

    it('should return false when the method fails', async () => {
      const get = client.get as jest.Mock;
      const setex = client.setex as jest.Mock;

      get.mockImplementation(() => 0);
      setex.mockImplementation(() => 'NOT_OK');

      const result = await repository.addWarn('test');

      expect(result).toBe(false);
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('test');
      expect(setex).toHaveBeenCalledTimes(1);
      expect(setex).toHaveBeenLastCalledWith(
        'test',
        config.warn.refreshPeriod,
        1,
      );
    });
  });

  describe('clearWarn', () => {
    it('should return true when warnings have been cleared', async () => {
      const del = client.del as jest.Mock;
      del.mockImplementation(() => 1);

      const result = await repository.clearWarn('test');

      expect(result).toBe(true);
      expect(del).toHaveBeenCalledTimes(1);
      expect(del).toHaveBeenCalledWith('test');
    });

    it('should return false when the method fails', async () => {
      const del = client.del as jest.Mock;
      del.mockImplementation(() => -1);

      const result = await repository.clearWarn('test');

      expect(result).toBe(false);
      expect(del).toHaveBeenCalledTimes(1);
      expect(del).toHaveBeenCalledWith('test');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
