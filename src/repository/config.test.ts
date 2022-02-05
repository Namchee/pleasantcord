import {
  afterEach,
  describe,
  expect,
  it,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';

import NodeCache from 'node-cache';

import { BASE_CONFIG } from '@/entity/config';
import {
  CloudflareConfigurationRepository,
  LocalConfigurationCache,
} from '@/repository/config';
import { FIVE_MINUTES } from '@/constants/time';
import { apiServer } from '@/mocks/server';
import { Logger } from '@/utils/logger';

describe('LocalConfigurationCache', () => {
  describe('getConfig', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return a valid configuration object', () => {
      const cache = new NodeCache();

      const getSpy = vi.spyOn(cache, 'get');
      getSpy.mockImplementationOnce(() => BASE_CONFIG);

      const localCache = new LocalConfigurationCache(cache);
      const output = localCache.getConfig('123');

      expect(output).toEqual(BASE_CONFIG);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenLastCalledWith('123');
    });

    it('should return null', () => {
      const cache = new NodeCache();

      const getSpy = vi.spyOn(cache, 'get');
      getSpy.mockImplementationOnce(() => undefined);

      const localCache = new LocalConfigurationCache(cache);
      const output = localCache.getConfig('123');

      expect(output).toBeNull();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenLastCalledWith('123');
    });
  });

  describe('setConfig', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set the local cache', () => {
      const cache = new NodeCache();

      const setSpy = vi.spyOn(cache, 'set');

      const localCache = new LocalConfigurationCache(cache);
      localCache.setConfig('123', BASE_CONFIG);

      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(setSpy).toHaveBeenLastCalledWith('123', BASE_CONFIG, FIVE_MINUTES);
    });
  });

  describe('deleteConfig', () => {
    it('should delete a configuration from the cache', () => {
      const cache = new NodeCache();

      const delSpy = vi.spyOn(cache, 'del');

      const localCache = new LocalConfigurationCache(cache);
      localCache.deleteConfig('123');

      expect(delSpy).toHaveBeenCalledTimes(1);
      expect(delSpy).toHaveBeenLastCalledWith('123');
    });
  });
});

describe('CloudflareConfigurationRepository', () => {
  const url = 'http://api.test/api';

  beforeAll(() => {
    apiServer.listen();
    process.env.DSN = 'https://public@sentry.example.com/1';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    apiServer.resetHandlers();
  });

  afterAll(() => {
    apiServer.close();
  });

  describe('getConfig', () => {
    it('should return a configuration object', async () => {
      const repository = new CloudflareConfigurationRepository(url, '');

      const config = await repository.getConfig('123');

      expect(config).toEqual({
        server_id: 123,
        ...BASE_CONFIG,
      });
    });

    it('should return null', async () => {
      const repository = new CloudflareConfigurationRepository(url, '');

      const loggerSpy = vi.spyOn(Logger.getInstance(), 'logBot');

      const config = await repository.getConfig('456');

      expect(config).toEqual(null);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createConfig', () => {
    it('should create a configuration', async () => {
      const repository = new CloudflareConfigurationRepository(url, '');

      const config = await repository.createConfig('123', BASE_CONFIG);

      expect(config).toBe(true);
    });

    it('should return false', async () => {
      const repository = new CloudflareConfigurationRepository(url, '');

      const loggerSpy = vi.spyOn(Logger.getInstance(), 'logBot');

      const config = await repository.createConfig('456', BASE_CONFIG);

      expect(config).toBe(false);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteConfig', () => {
    it('should create a configuration', async () => {
      const repository = new CloudflareConfigurationRepository(url, '');

      const config = await repository.deleteConfig('123');

      expect(config).toBe(true);
    });

    it('should return false', async () => {
      const repository = new CloudflareConfigurationRepository(url, '');

      const loggerSpy = vi.spyOn(Logger.getInstance(), 'logBot');

      const config = await repository.deleteConfig('456');

      expect(config).toBe(false);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
