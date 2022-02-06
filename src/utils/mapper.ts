import { predictionType } from 'nsfwjs';

import type { Category, Label } from './../entity/content';

/**
 * Map predictions into categories
 *
 * @param {predictionType[]} classifications NSFWJS's predictions
 * @returns {Category[]} list of categories
 */
export function mapClassificationsToCategories(
  classifications: predictionType[],
): Category[] {
  return classifications.map((c) => {
    return {
      name: c.className,
      accuracy: c.probability,
    };
  });
}

/**
 * Aggregate list of predictions into categories.
 * Useful for aggregating multiple frames result, such as
 * videos or GIFs.
 *
 * @param {predictionType[][]} predictions NSFWJS's list of predicitions
 * @return {Category[]} list of categories
 */
export function aggregatePrediction(
  predictions: predictionType[][],
): Category[] {
  const frequency: Record<Label, number> = {
    Drawing: 0,
    Hentai: 0,
    Neutral: 0,
    Porn: 0,
    Sexy: 0,
  };

  predictions.forEach((cat) => {
    frequency[cat[0].className]++;
  });

  const categories = Object.entries(frequency).map((value): Category => {
    const cat = value[0] as Label;

    return {
      name: cat,
      accuracy: (frequency[cat] / predictions.length),
    };
  });

  return categories;
}
