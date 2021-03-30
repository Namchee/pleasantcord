
import * as tf from '@tensorflow/tfjs-node';
import { load, NSFWJS } from 'nsfwjs';

import config from './../config/env';

const { env } = config;

export interface SFWVerdict {
  isSFW: boolean;
  confidence: number;
}

type CategoryName = 'Drawing' | 'Hentai' | 'Porn' | 'Neutral' | 'Sexy';
export interface ImageCategory {
  name: CategoryName;
  confidence: number;
}

export interface ImageClassification {
  isSFW: boolean;
  category: ImageCategory;
  classification: ImageCategory[];
}

export class NSFWClassifier {
  private static instance: NSFWClassifier;

  private constructor(private readonly model: NSFWJS) {
    if (env.NODE_ENV === 'development') {
      tf.enableDebugMode();
    } else {
      tf.enableProdMode();
    }
  }

  public static async initializeCache(): Promise<void> {
    await NSFWClassifier.getInstance();
  }

  public static async getInstance(): Promise<NSFWClassifier> {
    if (!NSFWClassifier.instance) {
      const model = await load(
        'file://src/service/tfjs-models/',
        { size: 299 },
      );

      NSFWClassifier.instance = new NSFWClassifier(model);
    }

    return NSFWClassifier.instance;
  }

  public async classifyImage(
    imageBuffer: Buffer,
  ): Promise<ImageClassification> {
    const decodedImage = tf.node.decodeImage(imageBuffer, 3);
    const classification = await this.model.classify(decodedImage);

    let bestCategory!: ImageCategory;

    const categories = classification.map((prediction) => {
      const category = {
        name: prediction.className as CategoryName,
        confidence: prediction.probability,
      };

      if (!bestCategory || category.confidence > bestCategory.confidence) {
        bestCategory = category;
      }

      return category;
    });

    return {
      isSFW: bestCategory.name !== 'Hentai' && bestCategory.name !== 'Porn',
      category: bestCategory,
      classification: categories,
    };
  }
}
