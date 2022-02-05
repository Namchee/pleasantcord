import { rest } from 'msw';

export const handlers = [
  rest.get('http://api.test/api/config/123', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 200,
        data: {
          server_id: 123,
          accuracy: 0.15,
          categories: ['Sexy', 'Hentai', 'Porn'],
          delete: true,
        },
      }),
    );
  }),

  rest.get('http://api.test/api/config/456', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        status: 500,
        data: null,
        error: 'Foo bar',
      }),
    );
  }),
];
