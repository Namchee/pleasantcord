
import * as tf from '@tensorflow/tfjs-node';
import { load, NSFWJS } from 'nsfwjs';

import { ImageCategory } from '../constants/content';

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
   * @param {Buffer} imageBuffer image in `Buffer` format
   * @returns {Promise<ImageCategory[]>} image labels with accuracy numbers.
   */
  public async classifyImage(imageBuffer: Buffer): Promise<ImageCategory[]> {
    let predictions = 1;

    if (process.env.NODE_ENV === 'development') {
      predictions = 5;
    }
    const decodedImage = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;

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
}
