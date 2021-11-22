
import * as tf from '@tensorflow/tfjs-node';
import { expose } from 'threads/worker';
import { Label, Category } from '../entity/content';

import { NSFWJS } from 'nsfwjs';
import { fetchContent } from '../utils/fetcher';

/**
 * Classify an image to 5 categories
 *
 * @param {Buffer} buffer image in `Buffer` format
 * @returns {Promise<Category[]>} image labels with accuracy numbers.
 */
async function classifyImage(
  model: NSFWJS,
  buffer: Buffer,
): Promise<Category[]> {
  let predictions = 1;

  if (process.env.NODE_ENV === 'development') {
    predictions = 5;
  }
  const decodedImage = tf.node.decodeImage(buffer) as tf.Tensor3D;

  const classification = await model.classify(decodedImage, predictions);
  // prevent memory leak
  decodedImage.dispose();
  const categories = classification.map((c) => {
    return {
      name: c.className,
      accuracy: c.probability,
    };
  });

  categories.sort((a, b) => {
    return a.accuracy > b.accuracy ? -1 : 1;
  });

  return categories;
}

/**
 * Classify a GIF to 5 categories
 *
 * @param {Buffer} buffer GIF in `Buffer` format
 * @returns {Promise<ContentCategory[]>} GIF labels with accuracy numbers.
 */
async function classifyGif(model: NSFWJS, buffer: Buffer): Promise<Category[]> {
  const categories = await model.classifyGif(buffer, {
    topk: 1,
  });

  const frequency: Record<Label, number> = {
    Hentai: 0,
    Porn: 0,
    Neutral: 0,
    Drawing: 0,
    Sexy: 0,
  };

  categories.forEach((cat) => {
    frequency[cat[0].className]++;
  });

  const result = Object.entries(frequency).map((value): Category => {
    const cat = value[0] as Label;
    return {
      name: cat,
      accuracy: (frequency[cat] / categories.length),
    };
  }).sort((a, b) => a.accuracy > b.accuracy ? -1 : 1);

  if (process.env.NODE_ENV !== 'development') {
    return result.slice(0, 1);
  }

  return result;
}

async function classify(
  model: NSFWJS,
  source: string,
  type: 'gif' | 'image',
): Promise<Category[]> {
  const buffer = await fetchContent(source);

  return type === 'gif' ?
    classifyGif(model, buffer) :
    classifyImage(model, buffer);
}

export type Classifier = typeof classify;

expose(classify);
