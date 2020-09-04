import axios from 'axios';
import { isNSFW } from './nsfw';
import { SFWVerdict } from '@/common/types';
import apiConfig from '@/config/api';

jest.mock('axios');

describe('isNSFW', () => {
  it('should return a SFW verdict', async () => {
    const axiosMock = axios.get as jest.Mock;
    axiosMock.mockImplementationOnce(() => ({
      data: {
        outputs: {
          data: {
            concepts: [
              {
                'name': 'nsfw',
                'value': 0.84,
              },
            ],
          },
        },
      },
    }));

    const result: SFWVerdict = await isNSFW('test');

    expect(result.isSFW).toBe(true);
    expect(axiosMock).toHaveBeenCalledTimes(1);

    expect(axiosMock).toHaveBeenCalledWith(
      `${apiConfig.url}/${apiConfig.modelId}/outputs`,
      {
        headers: {
          'Authorization': 'Key key',
          'Content-type': 'application/json',
        },
        data: {
          inputs: {
            data: {
              image: {
                url: 'test',
              },
            },
          },
        },
      },
    );
  });

  it('should return a NSFW verdict', async () => {
    const axiosMock = axios.get as jest.Mock;
    axiosMock.mockImplementationOnce(() => ({
      data: {
        outputs: {
          data: {
            concepts: [
              {
                'name': 'nsfw',
                'value': 0.86,
              },
            ],
          },
        },
      },
    }));

    const result: SFWVerdict = await isNSFW('test');

    expect(result.isSFW).toBe(false);
    expect(result.confidence).toBe(0.86);
    expect(axiosMock).toHaveBeenCalledTimes(1);

    expect(axiosMock).toHaveBeenCalledWith(
      `${apiConfig.url}/${apiConfig.modelId}/outputs`,
      {
        headers: {
          'Authorization': 'Key key',
          'Content-type': 'application/json',
        },
        data: {
          inputs: {
            data: {
              image: {
                url: 'test',
              },
            },
          },
        },
      },
    );
  });

  it(
    'should return a SFW verdict if "nsfw" category is not present',
    async () => {
      const axiosMock = axios.get as jest.Mock;
      axiosMock.mockImplementationOnce(() => ({
        data: {
          outputs: {
            data: {
              concepts: [
                {
                  'name': 'sfw',
                  'value': 0.84,
                },
              ],
            },
          },
        },
      }));

      const result: SFWVerdict = await isNSFW('test');

      expect(result.isSFW).toBe(true);
      expect(axiosMock).toHaveBeenCalledTimes(1);

      expect(axiosMock).toHaveBeenCalledWith(
        `${apiConfig.url}/${apiConfig.modelId}/outputs`,
        {
          headers: {
            'Authorization': 'Key key',
            'Content-type': 'application/json',
          },
          data: {
            inputs: {
              data: {
                image: {
                  url: 'test',
                },
              },
            },
          },
        },
      );
    });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
