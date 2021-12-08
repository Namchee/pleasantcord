
import * as tf from '@tensorflow/tfjs-node';

import { NSFWJS, load } from 'nsfwjs';
import { expose } from 'threads/worker';

import { Category, Label } from '../entity/content';
import { fetchContent } from '../utils/fetcher';

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
    const buffer = await fetchContent(source);
    const model = await getModel();

    let predictions = 1;

    if (process.env.NODE_ENV === 'development') {
      predictions = 5;
    }
    const decodedImage = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;

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
  },

  classifyGIF: async (source: string): Promise<Category[]> => {
    const buffer = await fetchContent(source);
    const model = await getModel();

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
  },
};

export type Classifier = typeof classifier;

expose(classifier);
