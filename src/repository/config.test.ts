import { afterEach, describe, expect, it, vi } from 'vitest';

import NodeCache from 'node-cache';

import { BASE_CONFIG } from '@/entity/config';
import { LocalConfigurationCache } from '@/repository/config';
import { FIVE_MINUTES } from '@/constants/time';

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
