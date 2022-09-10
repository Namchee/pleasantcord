import NodeCache from 'node-cache';

import { THREE_SECONDS } from '../constants/time.js';

export interface RateLimiter {
  isRateLimited(key: string): boolean;
  rateLimit(key: string): void;
}

export class LocalRateLimiter implements RateLimiter {
  public constructor(private readonly cache: NodeCache) {}

  public isRateLimited(key: string): boolean {
    return this.cache.get(key) || false;
  }

  public rateLimit(key: string): void {
    this.cache.set(key, true, THREE_SECONDS);
  }
}
