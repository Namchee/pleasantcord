import axios from 'axios';

import config from './../config/env';
import apiConfig from './../config/api';

const { env, bot } = config;

export interface SFWVerdict {
  isSFW: boolean;
  confidence: number;
}

/**
 * Classify an image based on it's safe-for-work value
 * @param {string} url Image URL
 * @returns Verdict object, which contains a `boolean` value
 * that determines if it's SFW or NSFW and prediction accuracy
 */
export async function isNSFW(url: string): Promise<SFWVerdict> {
  const { data } = await axios.post(
    `${apiConfig.url}/${apiConfig.modelId}/outputs`,
    {
      inputs: [
        {
          data: {
            image: {
              url,
            },
          },
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${env.CLARIFAI_KEY}`,
      },
    },
  );

  const concepts = data.outputs[0].data.concepts;

  for (const concept of concepts) {
    if (concept.name === apiConfig.conceptName &&
      concept.value >= bot.confidence
    ) {
      return {
        isSFW: false,
        confidence: concept.value,
      };
    }
  }

  return {
    isSFW: true,
    confidence: 1,
  };
}
