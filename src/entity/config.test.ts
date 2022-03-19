import { describe, expect, it } from 'vitest';

import {
  Configuration,
  BASE_CONFIG,
  getContentTypeFromConfig,
} from '@/entity/config';

describe('getContentTypeFromConfig', () => {
  it('should filter images and videos', () => {
    const mimes = getContentTypeFromConfig(BASE_CONFIG);

    expect(mimes).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
    ]);
  });

  it('should return an empty array', () => {
    const config = {
      ...BASE_CONFIG,
      content: [],
    };

    const mimes = getContentTypeFromConfig(config);

    expect(mimes.length).toBe(0);
  });

  it('should return images only', () => {
    const config: Configuration = {
      ...BASE_CONFIG,
      content: ['Image'],
    };

    const mimes = getContentTypeFromConfig(config);

    expect(mimes).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]);
  });
});
