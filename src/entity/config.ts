import { CONTENT_TYPE_MAP } from '../constants/content';

import type { Label } from './content';

export type ModelType = 'MobileNet' | 'Inception';
export type ContentType = 'Image' | 'Video' | 'Sticker';

// pleasantcord's server configuration. Unique per server.
export interface Configuration {
  // Minimum accuracy level to be classified as NSFW
  readonly accuracy: number;
  // List of image categories
  readonly categories: Label[];
  // Determine if possible NSFW contents should be deleted or not.
  readonly delete: boolean;
  // Model name to be used to classifify contents
  readonly model: ModelType;
  // Content type to be moderated
  readonly contents: ContentType[];
}

// Default configuration for all servers.
export const BASE_CONFIG: Configuration = {
  accuracy: 0.75,
  categories: ['Hentai', 'Porn'],
  delete: true,
  model: 'MobileNet',
  contents: ['Image', 'Video'],
};

/**
 * Get user-supported content type from configuration object
 *
 * @param {Configuration} config server configuration
 * @returns {string[]} array of supported mime types
 */
export function getContentTypeFromConfig(config: Configuration): string[] {
  const mime: string[] = [];

  config.contents.forEach(type => {
    mime.push(...CONTENT_TYPE_MAP[type]);
  });

  return mime;
}
