import {
  describe,
  it,
  vi,
  beforeAll,
  afterAll,
  afterEach,
  expect,
} from 'vitest';

import { contentServer } from '@/mocks/server';

import fetcher from '@/utils/fetcher';
import cheerio from 'cheerio';

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
    const content = await fetcher.fetchContent('http://www.foo.test/test.png');
    expect(content).toBeInstanceOf(Buffer);
  });

  it('should return a Giphy GIF Buffer', async () => {
    const spy = vi.spyOn(fetcher, 'fetchContent');
    const cheerioSpy = vi.spyOn(cheerio, 'load');

    const content = await fetcher.fetchContent('http://www.giphy.com/test');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('http://i.giphy.com/test.gif');
    expect(cheerioSpy).toHaveBeenCalledTimes(1);
    expect(content).toBeInstanceOf(Buffer);
  });

  it('should return a Tenor GIF Buffer', async () => {
    const spy = vi.spyOn(fetcher, 'fetchContent');
    const cheerioSpy = vi.spyOn(cheerio, 'load');

    const content = await fetcher.fetchContent('http://www.tenor.com/test');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('http://c.tenor.com/test.gif');
    expect(cheerioSpy).toHaveBeenCalledTimes(1);
    expect(content).toBeInstanceOf(Buffer);
  });

  it('shoud return a WebP Buffer', async () => {
    const spy = vi.spyOn(fetcher, 'fetchContent');
    const content = await fetcher.fetchContent(
      'http://www.google.com/test.webp'
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(buffer).toHaveBeenCalledTimes(1);
    expect(content).toBeInstanceOf(Buffer);
  });

  // simulate error by mocking cheerio
  it('should throw an error', async () => {
    const fetcherSpy = vi.spyOn(fetcher, 'fetchContent');
    const consoleSpy = vi.spyOn(console, 'error');

    const cheerioSpy = vi.spyOn(cheerio, 'load');
    cheerioSpy.mockImplementationOnce(() => {
      throw new Error('foo');
    });
    consoleSpy.mockImplementationOnce(() => vi.fn());

    try {
      await fetcher.fetchContent('http://www.tenor.com/test');

      throw new Error('Should fail');
    } catch (err) {
      const error = err as Error;

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(new Error('foo'));
      expect(fetcherSpy).toHaveBeenCalledTimes(1);
      expect(cheerioSpy).toHaveBeenCalledTimes(1);
      expect(error.message).toBe('Failed to fetch contents: foo');
    }
  });
});
