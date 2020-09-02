import { NSFWClassifier } from './nsfw';
import { node } from '@tensorflow/tfjs-node';
import { NSFWJS } from 'nsfwjs';
import axios from 'axios';

jest.mock('axios');
jest.mock('@tensorflow/tfjs-node');
jest.mock('nsfwjs');

describe('NSFWClassifier', () => {
  const dummyArray = new Uint8Array();

  let classifier: NSFWClassifier;
  let axiosMock: jest.Mock;
  let decodeMock: jest.Mock;
  let disposeMock: jest.Mock;

  beforeAll(() => {
    const model = new NSFWJS('', {});
    classifier = new NSFWClassifier(model);


    axiosMock = axios.get as jest.Mock;
    axiosMock.mockImplementation(jest.fn(() => dummyArray));
    decodeMock = node.decodeImage as jest.Mock;
    disposeMock = jest.fn();
    decodeMock.mockImplementation(jest.fn(() => ({ dispose: disposeMock })));
  });

  it('should return SFW verdict', async () => {
    const verdict = await classifier.isSFW('', 0.84);

    expect(verdict.isSFW).toBe(true);

    expect(decodeMock).toBeCalledWith(dummyArray, 3);
    expect(disposeMock).toBeCalledTimes(1);
    expect(axiosMock).toBeCalledWith('', { responseType: 'arraybuffer' });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
