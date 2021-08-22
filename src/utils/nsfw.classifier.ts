
import * as tf from '@tensorflow/tfjs-node';
import { load, NSFWJS } from 'nsfwjs';

export interface SFWVerdict {
  isSFW: boolean;
  confidence: number;
}

type CategoryName = 'Drawing' | 'Hentai' | 'Porn' | 'Neutral' | 'Sexy';
export interface ImageCategory {
  name: CategoryName;
  probability: number;
}

export interface ImageClassification {
  isSFW: boolean;
  category: ImageCategory;
  classification?: ImageCategory[];
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

  public async classifyImage(
    imageBuffer: Buffer,
    threshold: number,
  ): Promise<ImageClassification> {
    let predictions = 1;

    if (process.env.NODE_ENV === 'development') {
      predictions = 5;
    }
    const decodedImage = tf.node.decodeImage(imageBuffer, 3);

    const classification = await this.model.classify(decodedImage, predictions);
    const categories = classification.map((c) => {
      return {
        name: c.className,
        probability: c.probability,
      };
    });

    if (process.env.NODE_ENV === 'development') {
      categories.sort((a, b) => {
        return a.probability > b.probability ? -1 : 1;
      });
    }

    return {
      isSFW: !['Hentai', 'Porn'].includes(classification[0].className) ||
        classification[0].probability < threshold,
      category: categories[0],
      classification: process.env.NODE_ENV === 'development' ?
        categories :
        undefined,
    };
  }
}
