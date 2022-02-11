import NodeCache from 'node-cache';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalRateLimiter } from '@/service/rate-limit';
import { THREE_SECONDS } from '@/constants/time';

describe('LocalRateLimiter', () => {
  describe('isRateLimited', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true if key is found', () => {
      const cache = new NodeCache();

      const getSpy = vi.spyOn(cache, 'get');
      getSpy.mockImplementationOnce(() => true);

      const limiter = new LocalRateLimiter(cache);
      const output = limiter.isRateLimited('123');

      expect(output).toBe(true);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('123');
    });

    it('should return false if key does not exists', () => {
      const cache = new NodeCache();

      const getSpy = vi.spyOn(cache, 'get');
      getSpy.mockImplementationOnce(() => undefined);

      const limiter = new LocalRateLimiter(cache);
      const output = limiter.isRateLimited('123');

      expect(output).toBe(false);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('123');
    });
  });

  describe('rateLimit', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set a rate limit', () => {
      const cache = new NodeCache();

      const getSpy = vi.spyOn(cache, 'set');

      const limiter = new LocalRateLimiter(cache);
      limiter.rateLimit('123');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('123', true, THREE_SECONDS);
    });
  });
});
