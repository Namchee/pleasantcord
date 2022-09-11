import { ModelType } from './config.js';

// List of all content labels.
export type Label = 'Drawing' | 'Hentai' | 'Porn' | 'Neutral' | 'Sexy';

/**
 * Moderatable content.
 * Separated by content type.
 */
export interface Content {
  name: string;
  url: string;
}

/**
 * Content category as been classified by the NSFW classifier.
 */
export interface Category {
  name: Label;
  accuracy: number;
}

/**
 * Classification parameters for processing
 */
export interface ClassificationParam {
  source: string;
  model: ModelType;
  content: string[];
}

/**
 * Classification result.
 *
 * Returned from classification result from thread
 */
export interface ClassificationResult {
  name: string;
  source: string;
  categories: Category[];
  time?: number;
}

/**
 * Sort categories by their accuracy in descending order and
 * label in ascending order
 *
 * @param {Category[]} categories list of categories
 * @returns {Category[]} sorted categories in described order
 */
export function sortCategories(categories: Category[]): Category[] {
  return categories.sort((a, b) => {
    if (a.accuracy !== b.accuracy) {
      return a.accuracy > b.accuracy ? -1 : 1;
    }

    return a.name < b.name ? -1 : 1;
  });
}
