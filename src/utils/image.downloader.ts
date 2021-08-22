import fetch from 'node-fetch';

/**
 * Fetch an image from Discord's CDN
 * @param {string} url Image URL
 * @returns {Promise<Buffer>} image, in `Buffer`
 */
export async function fetchImage(url: string): Promise<Buffer> {
  try {
    const res = await fetch(url);
    return res.buffer();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }

    throw new Error('Failed to fetch contents from Discord\'s CDN');
  }
}
