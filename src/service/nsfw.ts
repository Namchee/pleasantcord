import axios from 'axios';

import { SFWVerdict } from '@/common/types';
import env from '@/config/env';
import apiConfig from '@/config/api';

export async function isNSFW(url: string): Promise<SFWVerdict> {
  const { data } = await axios.get(
    `${apiConfig.url}/${apiConfig.modelId}/outputs`,
    {
      headers: {
        'Authorization': `Key ${env.CLARIFAI_KEY}`,
        'Content-type': 'application/json',
      },
      data: {
        inputs: {
          data: {
            image: {
              url,
            },
          },
        },
      },
    },
  );

  const concepts = data.outputs.data.concepts;

  for (const concept of concepts) {
    if (concept.name === apiConfig.conceptName &&
      concept.value >= apiConfig.confidence
    ) {
      return {
        isSFW: false,
        confidence: concept.value,
      };
    }
  }

  return {
    isSFW: true,
  };
}
