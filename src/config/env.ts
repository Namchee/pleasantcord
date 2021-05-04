import { resolve } from 'path';

export default {
  env: {
    ...process.env,
  },
  bot: {
    ...require(
      resolve(process.cwd(), 'config.json'),
    ),
  },
};
