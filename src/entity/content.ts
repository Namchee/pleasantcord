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
