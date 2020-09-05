import { config } from 'dotenv';
import { resolve } from 'path';

function loadEnv(fileName: string): void {
  const result = config({
    path: resolve(process.cwd(), fileName),
  });

  if (result.error) {
    throw new Error('Environment variables doesn\'t exist');
  }
}

if (process.env.NODE_ENV === 'development') {
  loadEnv('.env');
}

if (process.env.NODE_ENV === 'test') {
  loadEnv('.env.test');
}

export default {
  ...process.env,
};
