import { describe, expect, it } from 'vitest';
import { predictionType } from 'nsfwjs';

import {
  aggregatePrediction,
  mapClassificationsToCategories,
} from '@/utils/mapper';

describe('mapClassificationsToCategories', () => {
  it('should map library objects to custom objects', () => {
    const predictions: predictionType[] = [
      {
        className: 'Porn',
        probability: 0.25,
      },
      {
        className: 'Sexy',
        probability: 0.15,
      },
      {
        className: 'Hentai',
        probability: 0.5,
      },
      {
        className: 'Drawing',
        probability: 0.05,
      },
      {
        className: 'Neutral',
        probability: 0.05,
      },
    ];

    const mapped = mapClassificationsToCategories(predictions);

    expect(mapped).toEqual([
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
    ]);
  });
});

describe('aggregatePredictions', () => {
  it('should aggregate predictions', () => {
    const predicitions: predictionType[][] = [
      [
        {
          className: 'Drawing',
          probability: 0.75,
        },
      ],
      [
        {
          className: 'Porn',
          probability: 0.9,
        },
      ],
      [
        {
          className: 'Drawing',
          probability: 0.91,
        },
      ],
      [
        {
          className: 'Porn',
          probability: 0.91,
        },
      ],
      [
        {
          className: 'Drawing',
          probability: 0.97,
        },
      ],
    ];

    const aggregate = aggregatePrediction(predicitions);
    expect(aggregate).toEqual([
      {
        name: 'Drawing',
        accuracy: 0.6,
      },
      {
        name: 'Hentai',
        accuracy: 0,
      },
      {
        name: 'Neutral',
        accuracy: 0,
      },
      {
        name: 'Porn',
        accuracy: 0.4,
      },
      {
        name: 'Sexy',
        accuracy: 0,
      },
    ]);
  });
});
