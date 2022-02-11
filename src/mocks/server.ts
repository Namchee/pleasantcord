import { setupServer } from 'msw/node';

import { handlers as apiHandlers } from '@/mocks/api';
import { handlers as contentHandlers } from '@/mocks/content';

export const apiServer = setupServer(...apiHandlers);
export const contentServer = setupServer(...contentHandlers);
