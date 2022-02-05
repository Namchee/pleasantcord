import { setupServer } from 'msw/node';

import { handlers } from '@/mocks/api';

export const apiServer = setupServer(...handlers);
