// List of all content labels.
export type Label = 'Drawing' | 'Hentai' | 'Porn' | 'Neutral' | 'Sexy';

/**
 * Moderatable content.
 * Separated by content type.
 */
export interface Content {
  type: 'gif' | 'image';
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
