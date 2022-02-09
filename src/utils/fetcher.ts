import fetch from 'node-fetch';
import cheerio from 'cheerio';
import sharp from 'sharp';

const fetchers = {
  /**
   * Fetch supported contents from either Discord's CDN or an
   * external provider.
   *
   * @param {string} source content URL
   * @returns {Promise<Buffer>} `Buffer` representation of `source`
   */
  fetchContent: async (source: string): Promise<Buffer> => {
    try {
      const response = await fetch(source);
      const header = response.headers.get('Content-Type');

      if (header?.match('text/html')) {
        const body = await response.text();

        const $ = cheerio.load(body);
        let url = $('meta[property="og:image"]').first().attr()['content'];

        if (url.endsWith('.mp4')) {
          url = url.replace('.mp4', '.gif');
        }

        return fetchers.fetchContent(url);
      }

      if (header?.match('image/webp')) {
        const buffer = await response.buffer();
        return sharp(buffer).jpeg().toBuffer();
      }

      return response.buffer();
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(err);
      }

      const error = err as Error;

      throw new Error(`Failed to fetch contents: ${error.message}`);
    }
  },
};

export default fetchers;
