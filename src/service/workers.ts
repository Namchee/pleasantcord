
import * as tf from '@tensorflow/tfjs-node';

import { NSFWJS, load } from 'nsfwjs';
import { expose } from 'threads/worker';

import {
  aggregatePrediction,
  mapClassificationsToCategories,
} from './../utils/mapper';
import fetcher from './../utils/fetcher';

import { sortCategories } from './../entity/content';

import type { Category } from './../entity/content';

let model: NSFWJS;

const getModel = async () => {
  if (!model) {
    const nsfwModel = await load(
      'file://tfjs-models/',
      { size: 299 },
    );

    model = nsfwModel;
  }

  return model;
};

const classifier = {
  classifyImage: async (source: string): Promise<Category[]> => {
    const buffer = await fetcher.fetchContent(source);
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
  },

  classifyGIF: async (source: string): Promise<Category[]> => {
    const buffer = await fetcher.fetchContent(source);
    const model = await getModel();

    const classification = await model.classifyGif(buffer, {
      topk: 1,
    });

    const categories = aggregatePrediction(classification);

    return sortCategories(categories);
  },
};

export type Classifier = typeof classifier;

expose(classifier);
