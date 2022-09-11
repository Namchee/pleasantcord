import fetch from 'node-fetch';
import cheerio from 'cheerio';
import sharp from 'sharp';

import type { Response } from 'node-fetch';

import { FFmpeg, createFFmpeg } from '@ffmpeg/ffmpeg';

export interface ContentData {
  mime: string;
  data: Buffer;
}

type Converter = (data: Response) => Promise<ContentData>;

const converterFunctions: Record<string, Converter> = {
  'video/mp4': convertVideoToGIF,
  'video/webm': convertVideoToGIF,
  'image/webp': convertWebPToJPG,
  'text/html': extractImageFromHTML,
};

let mpeg: FFmpeg;

/**
 * Convert video files to GIF format for model compatibility
 *
 * @param {Response} response raw response data
 * @returns {Promise<ContentData>} GIF buffer
 */
async function convertVideoToGIF(response: Response): Promise<ContentData> {
  if (!mpeg) {
    mpeg = createFFmpeg();
    await mpeg.load();
  }

  const type = (response.headers.get('Content-Type') as string)
    .split('/')
    .pop() as string;
  const buffer = await response.buffer();

  const input = `video.${type}`;
  const output = 'out.gif';

  mpeg.FS('writeFile', input, buffer);

  await mpeg.run('-i', input, '-f', 'gif', output);

  const result = mpeg.FS('readFile', output);

  return {
    mime: 'image/gif',
    data: Buffer.from(result),
  };
}

/**
 * Convert WebP files into JPG format for model compatibility
 *
 * @param {Response} response raw response data
 * @returns {Promise<ContentData>} JPG buffer
 */
async function convertWebPToJPG(response: Response): Promise<ContentData> {
  const buffer = await response.buffer();
  const jpegBuffer = await sharp(buffer).jpeg().toBuffer();

  return {
    mime: 'image/jpeg',
    data: jpegBuffer,
  };
}

/**
 * Extract image from an HTML document
 *
 * @param {Response} response raw response data
 * @returns {Promise<ContentData>} image buffer
 */
async function extractImageFromHTML(response: Response): Promise<ContentData> {
  const body = await response.text();

  const $ = cheerio.load(body);
  const url = $('meta[property="og:image"]').first().attr();

  if (url) {
    return fetchContent(url['content']);
  }

  return {
    mime: '',
    data: Buffer.from(''),
  };
}

/**
 * Fetch supported contents from either Discord's CDN or an
 * external provider.
 *
 * @param {string} source content URL
 * @returns {Promise<Buffer>} `Buffer` representation of `source`
 */
export async function fetchContent(source: string): Promise<ContentData> {
  try {
    const response = await fetch(source);
    const type = response.headers.get('Content-Type') ?? '';
    const mime = type.split(';').shift() ?? '';

    if (mime in converterFunctions) {
      return converterFunctions[mime](response);
    }

    const buffer = await response.buffer();

    return {
      mime,
      data: buffer,
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(err);
    }

    const error = err as Error;

    throw new Error(`Failed to fetch contents: ${error.message}`);
  }
}
