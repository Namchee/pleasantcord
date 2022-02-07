/* c8 ignore start */
import { rest } from 'msw';

import { BASE_CONFIG } from '@/entity/config';

export const handlers = [
  rest.get('http://api.test/api/config/123', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 200,
        data: {
          server_id: 123,
          ...BASE_CONFIG,
        },
      })
    );
  }),

  rest.get('http://api.test/api/config/456', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        status: 500,
        data: null,
        error: 'Foo bar',
      })
    );
  }),

  rest.post('http://api.test/api/config', (req, res, ctx) => {
    const body = JSON.parse(req.body as string);

    if (body.server_id === '456') {
      return res(
        ctx.status(500),
        ctx.json({
          status: 500,
          data: null,
          error: 'Foo bar',
        })
      );
    }

    return res(ctx.status(204));
  }),

  rest.delete('http://api.test/api/config/123', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  rest.delete('http://api.test/api/config/456', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        status: 500,
        data: null,
        error: 'Foo bar',
      })
    );
  }),

  // shut sentry
  rest.post('https://sentry.example.com/api/1/store/', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

/* c8 ignore end */
