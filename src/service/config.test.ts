import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ConfigurationCache,
  ConfigurationRepository,
} from '@/repository/config';

import { BASE_CONFIG, Configuration } from '@/entity/config';
import { ConfigurationService } from '@/service/config';

class MockConfigurationCache implements ConfigurationCache {
  getConfig = (): Configuration | null => {
    return null;
  };

  setConfig = (): void => {
    // empty
  };

  deleteConfig = (): void => {
    // empty
  };
}

class MockConfigurationRepository implements ConfigurationRepository {
  getConfig = async (): Promise<Configuration | null> => {
    return null;
  };

  setBotId = (): void => {
    // empty
  };

  deleteConfig = async (): Promise<boolean> => {
    return true;
  };

  createConfig = async (): Promise<boolean> => {
    return true;
  };
}

describe('ConfigurationService', () => {
  describe('getConfig', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch configuration from cache', async () => {
      const cache = new MockConfigurationCache();
      const repo = new MockConfigurationRepository();

      const getCacheSpy = vi.spyOn(cache, 'getConfig');
      const setCacheSpy = vi.spyOn(cache, 'setConfig');
      const getRepoSpy = vi.spyOn(repo, 'getConfig');

      getCacheSpy.mockImplementationOnce(() => BASE_CONFIG);

      const service = new ConfigurationService(cache, repo);
      const config = await service.getConfig('123');

      expect(config).toEqual(BASE_CONFIG);

      expect(getCacheSpy).toHaveBeenCalledTimes(1);
      expect(setCacheSpy).not.toHaveBeenCalled();
      expect(getRepoSpy).not.toHaveBeenCalled();
    });

    it('should fetch configuration from repository', async () => {
      const cache = new MockConfigurationCache();
      const repo = new MockConfigurationRepository();

      const getCacheSpy = vi.spyOn(cache, 'getConfig');
      const setCacheSpy = vi.spyOn(cache, 'setConfig');
      const getRepoSpy = vi.spyOn(repo, 'getConfig');

      getCacheSpy.mockImplementationOnce(() => null);
      getRepoSpy.mockImplementationOnce(async () => BASE_CONFIG);

      const service = new ConfigurationService(cache, repo);
      const config = await service.getConfig('123');

      expect(config).toEqual(BASE_CONFIG);

      expect(getCacheSpy).toHaveBeenCalledTimes(1);
      expect(getRepoSpy).toHaveBeenCalledTimes(1);
      expect(setCacheSpy).toHaveBeenCalledTimes(1);
      expect(setCacheSpy).toHaveBeenLastCalledWith('123', BASE_CONFIG);
    });
  });

  describe('createConfig', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a configuration', async () => {
      const cache = new MockConfigurationCache();
      const repo = new MockConfigurationRepository();

      const setCacheSpy = vi.spyOn(cache, 'setConfig');
      const createRepoSpy = vi.spyOn(repo, 'createConfig');

      createRepoSpy.mockImplementationOnce(async () => true);

      const service = new ConfigurationService(cache, repo);

      await service.createConfig('123', BASE_CONFIG);

      expect(setCacheSpy).toHaveBeenCalledTimes(1);
      expect(setCacheSpy).toHaveBeenLastCalledWith('123', BASE_CONFIG);
      expect(createRepoSpy).toHaveBeenCalledTimes(1);
      expect(createRepoSpy).toHaveBeenLastCalledWith('123', BASE_CONFIG);
    });

    it('should not save the configuration to cache', async () => {
      const cache = new MockConfigurationCache();
      const repo = new MockConfigurationRepository();

      const setCacheSpy = vi.spyOn(cache, 'setConfig');
      const createRepoSpy = vi.spyOn(repo, 'createConfig');

      createRepoSpy.mockImplementationOnce(async () => false);

      const service = new ConfigurationService(cache, repo);

      await service.createConfig('123', BASE_CONFIG);

      expect(setCacheSpy).not.toHaveBeenCalled();
      expect(createRepoSpy).toHaveBeenCalledTimes(1);
      expect(createRepoSpy).toHaveBeenLastCalledWith('123', BASE_CONFIG);
    });
  });

  describe('deleteConfig', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should delete a configuration', async () => {
      const cache = new MockConfigurationCache();
      const repo = new MockConfigurationRepository();

      const deleteCacheSpy = vi.spyOn(cache, 'deleteConfig');
      const deleteRepoSpy = vi.spyOn(repo, 'deleteConfig');

      deleteRepoSpy.mockImplementationOnce(async () => true);

      const service = new ConfigurationService(cache, repo);

      await service.deleteConfig('123');

      expect(deleteCacheSpy).toHaveBeenCalledTimes(1);
      expect(deleteCacheSpy).toHaveBeenLastCalledWith('123');
      expect(deleteRepoSpy).toHaveBeenCalledTimes(1);
      expect(deleteRepoSpy).toHaveBeenLastCalledWith('123');
    });

    it('should not delete the configuration from cache', async () => {
      const cache = new MockConfigurationCache();
      const repo = new MockConfigurationRepository();

      const deleteCacheSpy = vi.spyOn(cache, 'deleteConfig');
      const deleteRepoSpy = vi.spyOn(repo, 'deleteConfig');

      deleteRepoSpy.mockImplementationOnce(async () => false);

      const service = new ConfigurationService(cache, repo);

      await service.deleteConfig('123');

      expect(deleteCacheSpy).not.toHaveBeenCalled();
      expect(deleteRepoSpy).toHaveBeenCalledTimes(1);
      expect(deleteRepoSpy).toHaveBeenLastCalledWith('123');
    });
  });
});
