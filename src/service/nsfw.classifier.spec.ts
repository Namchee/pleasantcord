import axios from 'axios';
import { isNSFW } from './nsfw.classifier';
import { SFWVerdict } from './../common/types';
import apiConfig from './../config/api';

jest.mock('axios');

describe('isNSFW', () => {
  it('should return a SFW verdict', async () => {
    const axiosMock = axios.post as jest.Mock;
    axiosMock.mockImplementationOnce(() => ({
      data: {
        outputs: [{
          data: {
            concepts: [
              {
                'name': 'nsfw',
                'value': 0.84,
              },
            ],
          },
        }],
      },
    }));

    const result: SFWVerdict = await isNSFW('test');

    expect(result.isSFW).toBe(true);
    expect(axiosMock).toHaveBeenCalledTimes(1);

    expect(axiosMock).toHaveBeenCalledWith(
      `${apiConfig.url}/${apiConfig.modelId}/outputs`,
      {
        inputs: [
          {
            data: {
              image: {
                url: 'test',
              },
            },
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key key`,
        },
      },
    );
  });

  it('should return a NSFW verdict', async () => {
    const axiosMock = axios.post as jest.Mock;
    axiosMock.mockImplementationOnce(() => ({
      data: {
        outputs: [{
          data: {
            concepts: [
              {
                'name': 'nsfw',
                'value': 0.85,
              },
            ],
          },
        }],
      },
    }));

    const result: SFWVerdict = await isNSFW('test');

    expect(result.isSFW).toBe(false);
    expect(result.confidence).toBe(0.85);
    expect(axiosMock).toHaveBeenCalledTimes(1);

    expect(axiosMock).toHaveBeenCalledWith(
      `${apiConfig.url}/${apiConfig.modelId}/outputs`,
      {
        inputs: [
          {
            data: {
              image: {
                url: 'test',
              },
            },
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key key`,
        },
      },
    );
  });

  it(
    'should return a SFW verdict if "nsfw" category is not present',
    async () => {
      const axiosMock = axios.post as jest.Mock;
      axiosMock.mockImplementationOnce(() => ({
        data: {
          outputs: [{
            data: {
              concepts: [
                {
                  'name': 'nsfw',
                  'value': 0.84,
                },
              ],
            },
          }],
        },
      }));

      const result: SFWVerdict = await isNSFW('test');

      expect(result.isSFW).toBe(true);
      expect(axiosMock).toHaveBeenCalledTimes(1);

      expect(axiosMock).toHaveBeenCalledWith(
        `${apiConfig.url}/${apiConfig.modelId}/outputs`,
        {
          inputs: [
            {
              data: {
                image: {
                  url: 'test',
                },
              },
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key key`,
          },
        },
      );
    });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
