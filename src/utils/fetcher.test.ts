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

    const content = await fetcher.fetchContent('http://www.giphy.com/test');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('http://i.giphy.com/test.gif');
    expect(content).toBeInstanceOf(Buffer);
  });

  it('should return a Tenor GIF Buffer', async () => {
    const spy = vi.spyOn(fetcher, 'fetchContent');

    const content = await fetcher.fetchContent('http://www.tenor.com/test.gif');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(content).toBeInstanceOf(Buffer);
  });

  it('shoud return a WebP Buffer', async () => {
    const content = await fetcher.fetchContent('http://www.google.com/test.webp');

    expect(buffer).toHaveBeenCalledOnce();
    expect(content).toBeInstanceOf(Buffer);
  });
});
