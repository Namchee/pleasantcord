// List of all content category.
export type Category = 'Drawing' | 'Hentai' | 'Porn' | 'Neutral' | 'Sexy';

// List of supported image files to be moderated.
// Should support all visual contents that also supported
// by Discord.
export const IMAGE_FILE = [
  'jpg',
  'jpeg',
  'png',
  'webp',
];

export interface ImageCategory {
  name: Category;
  accuracy: number;
}
