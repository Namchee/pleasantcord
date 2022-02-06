import { describe, expect, it } from 'vitest';

import { Category, sortCategories } from '@/entity/content';

describe('sortCategories', () => {
  it('should sort categories by accuracy in correct order', () => {
    const categories: Category[] = [
      {
        name: 'Porn',
        accuracy: 0.25,
      },
      {
        name: 'Sexy',
        accuracy: 0.15,
      },
      {
        name: 'Hentai',
        accuracy: 0.5,
      },
      {
        name: 'Drawing',
        accuracy: 0.05,
      },
      {
        name: 'Neutral',
        accuracy: 0.05,
      },
    ];

    const sorted = sortCategories(categories);

    expect(sorted).toEqual([
      {
        name: 'Hentai',
        accuracy: 0.5,
      },
      {
        name: 'Porn',
        accuracy: 0.25,
      },
      {
        name: 'Sexy',
        accuracy: 0.15,
      },
      {
        name: 'Drawing',
        accuracy: 0.05,
      },
      {
        name: 'Neutral',
        accuracy: 0.05,
      },
    ]);
  });

  it('should sort categories by their labels in correct order', () => {
    const categories: Category[] = [
      {
        name: 'Porn',
        accuracy: 0.2,
      },
      {
        name: 'Sexy',
        accuracy: 0.2,
      },
      {
        name: 'Hentai',
        accuracy: 0.2,
      },
      {
        name: 'Drawing',
        accuracy: 0.2,
      },
      {
        name: 'Neutral',
        accuracy: 0.2,
      },
    ];

    const sorted = sortCategories(categories);

    expect(sorted).toEqual([
      {
        name: 'Drawing',
        accuracy: 0.2,
      },
      {
        name: 'Hentai',
        accuracy: 0.2,
      },
      {
        name: 'Neutral',
        accuracy: 0.2,
      },
      {
        name: 'Porn',
        accuracy: 0.2,
      },
      {
        name: 'Sexy',
        accuracy: 0.2,
      },
    ]);
  });
});
