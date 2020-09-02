import { NSFWJS } from 'nsfwjs';
import { node } from '@tensorflow/tfjs-node';
import { ImageClass, SFWVerdict } from '@/common/types';
import axios from 'axios';

/**
 * A class that determines if an image is SFW or not
 */
export class NSFWClassifier {
  public constructor(private readonly model: NSFWJS) {}

  private classifyImage = async (image: Uint8Array): Promise<ImageClass[]> => {
    const tfImage = node.decodeImage(image, 3);
    const predictions = await this.model.classify(tfImage);

    tfImage.dispose();

    return predictions;
  }

  public isSFW = async (url: string, constant: number): Promise<SFWVerdict> => {
    const image = await axios.get<Uint8Array>(
      url,
      { responseType: 'arraybuffer' },
    );
    const classifications = await this.classifyImage(image.data);

    const verdict: SFWVerdict = {
      isSFW: true,
    };

    let bestClass = '';
    let bestProb = constant;

    for (const { className, probability } of classifications) {
      if (['hentai', 'porn'].includes(className) && probability > bestProb) {
        bestClass = className;
        bestProb = probability;
      }
    }

    if (bestClass.length > 0) {
      verdict.isSFW = false;
      verdict.reason = bestClass;
      verdict.confidence = bestProb;
    }

    return verdict;
  }
}
