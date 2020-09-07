import axios from 'axios';

/**
 * Fetch an image from Discord's CDN
 * @param {string} url Image URL
 * @returns Buffer
 */
export async function fetchImage(url: string): Promise<Buffer> {
  try {
    const imageBuffer = await axios.get(
      url,
      { responseType: 'arraybuffer' },
    );

    return Buffer.from(imageBuffer.data, 'base64');
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }

    throw new Error('Cannot fetch image from Discord\'s CDN');
  }
}
