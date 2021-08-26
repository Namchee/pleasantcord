import { Category } from '../constants/content';


// Configuration object which is unique per server.
export interface Configuration {
  // Minimum accuracy level to be classified as NSFW
  readonly threshold: number;
  // List of image
  readonly categories: Category[];
  readonly delete: boolean;
}

// Default configuration for all servers.
export const BASE_CONFIG: Configuration = {
  threshold: 0.75,
  categories: ['Hentai', 'Porn'],
  delete: true,
};
