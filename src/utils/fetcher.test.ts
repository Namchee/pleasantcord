import {
  describe,
  it,
  vi,
  beforeAll,
  afterAll,
  afterEach,
  expect,
} from 'vitest';
import cheerio from 'cheerio';

import { contentServer } from '@/mocks/server';

import { fetchContent } from '@/utils/fetcher';

const buffer = vi.fn(() => Buffer.from('loremipsum'));

vi.mock('sharp', () => {
  return {
    default: () => {
      return {
        jpeg: vi.fn().mockReturnThis(),
        toBuffer: buffer,
      };
    },
  };
});

describe('fetchContent', () => {
  beforeAll(() => {
    contentServer.listen();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    contentServer.resetHandlers();
  });

  afterAll(() => {
    vi.clearAllMocks();
    contentServer.close();
  });

  it('should return a PNG buffer', async () => {
    const { mime, data } = await fetchContent('http://www.foo.test/test.png');

    expect(mime).toBe('image/png');
    expect(data).toBeInstanceOf(Buffer);
  });

  it('should return a Giphy GIF Buffer', async () => {
    const cheerioSpy = vi.spyOn(cheerio, 'load');

    const { mime, data } = await fetchContent('http://www.giphy.com/test');

    expect(cheerioSpy).toHaveBeenCalledTimes(1);
    expect(mime).toBe('image/gif');
    expect(data).toBeInstanceOf(Buffer);
  });

  it('should return a Tenor GIF Buffer', async () => {
    const cheerioSpy = vi.spyOn(cheerio, 'load');

    const { mime, data } = await fetchContent('http://www.tenor.com/test');

    expect(cheerioSpy).toHaveBeenCalledTimes(1);

    expect(mime).toBe('image/gif');
    expect(data).toBeInstanceOf(Buffer);
  });

  it('shoud return a WebP Buffer', async () => {
    const { mime, data } = await fetchContent(
      'http://www.google.com/test.webp'
    );

    expect(buffer).toHaveBeenCalledTimes(1);

    expect(mime).toBe('image/jpeg');
    expect(data).toBeInstanceOf(Buffer);
  });

  // simulate error by mocking cheerio
  it('should throw an error', async () => {
    const cheerioSpy = vi.spyOn(cheerio, 'load');
    cheerioSpy.mockImplementationOnce(() => {
      throw new Error('foo');
    });

    try {
      await fetchContent('http://www.tenor.com/test');

      throw new Error('Should fail');
    } catch (err) {
      const error = err as Error;

      expect(cheerioSpy).toHaveBeenCalledTimes(1);
      expect(error.message).toBe('foo');
    }
  });
});
