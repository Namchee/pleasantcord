import axios from 'axios';
import { fetchImage } from './image.downloader';

jest.mock('axios');

describe('Discord CDN Downloader', () => {
  it('should fetch image and return it as `Buffer`', async () => {
    const axiosMock = axios.get as jest.Mock;
    const bufferSpy = jest.spyOn(Buffer, 'from');
    const expected = { data: 'test' };

    axiosMock.mockImplementation(() => expected);

    const result = await fetchImage('url');

    expect(axiosMock).toHaveBeenCalledTimes(1);
    expect(axiosMock).toHaveBeenCalledWith(
      'url',
      { responseType: 'arraybuffer' },
    );

    expect(bufferSpy).toBeCalledTimes(1);
    expect(bufferSpy).toHaveBeenCalledWith('test', 'base64');

    expect(result).toStrictEqual(Buffer.from('test', 'base64'));
  });

  it('should throw an error when the image cannot be fetched', async () => {
    const axiosMock = axios.get as jest.Mock;

    axiosMock.mockImplementation(() => {
      throw new Error();
    });

    await expect(fetchImage(''))
      .rejects
      .toEqual(new Error('Cannot fetch image from Discord\'s CDN'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
