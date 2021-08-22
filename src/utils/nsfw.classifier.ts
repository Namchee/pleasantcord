
import * as tf from '@tensorflow/tfjs-node';
import { load, NSFWJS } from 'nsfwjs';
import { CategoryName } from '../entity/config';

export interface ImageCategory {
  name: CategoryName;
  probability: number;
}

export class NSFWClassifier {
  private constructor(private readonly model: NSFWJS) {
    if (process.env.NODE_ENV === 'development') {
      tf.enableDebugMode();
    } else {
      tf.enableProdMode();
    }
  }

  public static async newClassifier(): Promise<NSFWClassifier> {
    const model = await load(
      'file://tfjs-models/',
      { size: 299 },
    );

    return new NSFWClassifier(model);
  }

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
        probability: c.probability,
      };
    });

    categories.sort((a, b) => {
      return a.probability > b.probability ? -1 : 1;
    });

    return categories;
  }
}
