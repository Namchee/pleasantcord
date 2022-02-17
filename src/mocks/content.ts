import { rest } from 'msw';

export const handlers = [
  rest.get('http://www.foo.test/test.png', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'image/png'),
      ctx.body(Buffer.from('data:image/png;base64, asdljafhsSa'))
    );
  }),

  rest.get('http://www.giphy.com/test', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'text/html'),
      ctx.body(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Definitely Giphy</title>
          <meta property="og:image" content="http://i.giphy.com/test.gif" />
      </head>
      <body>
          
      </body>
      </html>`)
    );
  }),

  rest.get('http://i.giphy.com/test.gif', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'image/gif'),
      ctx.body(Buffer.from('data:image/gif;base64, loremipsumdolorsilamet'))
    );
  }),

  rest.get('http://www.ganteng.com/video.mp4', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'video/mp4'),
      ctx.body(Buffer.from('data:video/mp4;base64, loremipsumdolorsilamet'))
    );
  }),

  rest.get('http://www.tenor.com/test', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'text/html'),
      ctx.body(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Definitely Giphy</title>
          <meta property="og:image" content="http://c.tenor.com/test.gif" />
      </head>
      <body>
          
      </body>
      </html>`)
    );
  }),

  rest.get('http://c.tenor.com/test.gif', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'image/gif'),
      ctx.body(Buffer.from('data:image/gif;base64, loremipsumdolorsilamet'))
    );
  }),

  rest.get('http://www.google.com/test.webp', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'image/webp'),
      ctx.body(Buffer.from('data:image/webp;base64, loremipsumdolorsilamet'))
    );
  }),

  rest.get('http://www.test.com/unsupported', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'text/html'),
      ctx.body(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Definitely Unsupported</title>
      </head>
      <body>
          
      </body>
      </html>`)
    );
  }),
];
