
import * as tf from '@tensorflow/tfjs-node';
import { load, NSFWJS } from 'nsfwjs';

import { Category, ContentCategory } from '../constants/content';

/**
 * NSFW content classifier.
 * Determine whether a posted content is SFW or not.
 */
export class NSFWClassifier {
  private constructor(private readonly model: NSFWJS) {
    if (process.env.NODE_ENV === 'development') {
      tf.enableDebugMode();
    } else {
      tf.enableProdMode();
    }
  }

  /**
   * Bootstrap the classifier by loading and caching the model.
   *
   * @returns {Promise<NSFWClassifier>} NSFWClassifier instance.
   */
  public static async newClassifier(): Promise<NSFWClassifier> {
    const model = await load(
      'file://tfjs-models/',
      { size: 299 },
    );

    return new NSFWClassifier(model);
  }

  /**
   * Classify an image to 5 categories
   *
   * @param {Buffer} buffer image in `Buffer` format
   * @returns {Promise<ContentCategory[]>} image labels with accuracy numbers.
   */
  public async classifyImage(buffer: Buffer): Promise<ContentCategory[]> {
    let predictions = 1;

    if (process.env.NODE_ENV === 'development') {
      predictions = 5;
    }
    const decodedImage = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;

    const classification = await this.model.classify(decodedImage, predictions);
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
  public async classifyGif(buffer: Buffer): Promise<ContentCategory[]> {
    const classification = await this.model.classifyGif(buffer, {
      topk: 1,
    });

    const frequency: Record<Category, number> = {
      Hentai: 0,
      Porn: 0,
      Neutral: 0,
      Drawing: 0,
      Sexy: 0,
    };

    classification.forEach((classify) => {
      const top = classify[0];
      frequency[top.className]++;
    });

    const result = Object.entries(frequency).map((value): ContentCategory => {
      const cat = value[0] as Category;
      return {
        name: cat,
        accuracy: (frequency[cat] / classification.length),
      };
    }).sort((a, b) => a.accuracy > b.accuracy ? -1 : 1);

    if (process.env.NODE_ENV !== 'development') {
      return result.slice(0, 1);
    }

    return result;
  }
}
