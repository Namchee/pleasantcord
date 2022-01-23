import { Label } from '../entity/content';

// pleasantcord's server configuration. Unique per server.
export interface Configuration {
  // Minimum accuracy level to be classified as NSFW
  readonly accuracy: number;
  // List of image categories
  readonly categories: Label[];
  // Determine if possible NSFW contents should be deleted or not.
  readonly delete: boolean;
}

// Default configuration for all servers.
export const BASE_CONFIG: Configuration = {
  accuracy: 0.75,
  categories: ['Hentai', 'Porn'],
  delete: true,
};
