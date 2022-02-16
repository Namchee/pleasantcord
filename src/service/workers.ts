import * as tf from '@tensorflow/tfjs-node';

import { NSFWJS, load } from 'nsfwjs';
import { expose } from 'threads/worker';

import {
  aggregatePrediction,
  mapClassificationsToCategories,
} from './../utils/mapper';
import { fetchContent } from './../utils/fetcher';

import { sortCategories } from './../entity/content';
import type { Category } from './../entity/content';

import { SUPPORTED_CONTENTS } from './../constants/content';

let model: NSFWJS;

/**
 * Get NSFWJS model. Will return existing instance if possible
 *
 * @returns {Promise<NSFWJS>} NSFWJS model
 */
async function getModel(): Promise<NSFWJS> {
  if (!model) {
    const nsfwModel = await load('file://tfjs-models/inception/', {
      size: 299,
    });

    model = nsfwModel;
  }

  return model;
}

/**
 * Classify image into multiple labels
 *
 * @param {Buffer} buffer image buffer
 * @returns {Promise<Category[]>} content labels, sorted
 * by descending accuracy.
 */
async function classifyImage(buffer: Buffer): Promise<Category[]> {
  const model = await getModel();

  let predictions = 1;

  if (process.env.NODE_ENV !== 'production') {
    predictions = 5;
  }
  const decodedImage = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;

  const classification = await model.classify(decodedImage, predictions);
  // prevent memory leak
  decodedImage.dispose();

  const categories = mapClassificationsToCategories(classification);

  return sortCategories(categories);
}

/**
 * Classify GIFs into multiple labels
 *
 * @param {Buffer} buffer GIF buffer
 * @returns {Promise<Category[]>} content labels, sorted
 * by descending accuracy
 */
async function classifyGIF(buffer: Buffer): Promise<Category[]> {
  const model = await getModel();

  const classification = await model.classifyGif(buffer, {
    topk: 1,
  });

  const categories = aggregatePrediction(classification);

  return sortCategories(categories);
}

/**
 * Classify supported contents into multiple labels
 *
 * @param {string} source content URL
 * @returns {Promise<Category[]>} content labels, sorted
 * by descending accuracy
 */
const classify = async (source: string): Promise<Category[]> => {
  const { mime, data } = await fetchContent(source);

  if (!SUPPORTED_CONTENTS.includes(mime)) {
    return [];
  }

  return mime === 'image/gif' ? classifyGIF(data) : classifyImage(data);
};

export type Classifier = (source: string) => Promise<Category[]>;

expose(classify);
