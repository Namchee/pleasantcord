export type CategoryName = 'Drawing' | 'Hentai' | 'Porn' | 'Neutral' | 'Sexy';

export interface Configuration {
  readonly threshold: number;
  readonly categories: CategoryName[];
  readonly delete: boolean;
}

export const BASE_CONFIG: Configuration = {
  threshold: 0.75,
  categories: ['Hentai', 'Porn'],
  delete: true,
};
