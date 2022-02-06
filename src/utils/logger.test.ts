import {
  describe,
  vi,
  afterEach,
  it,
  expect,
  beforeEach,
  MockedFunction,
} from 'vitest';
import { captureException, close } from '@sentry/node';

import { Logger } from '@/utils/logger';

vi.mock('@sentry/node', () => {
  return {
    init: vi.fn(),
    captureException: vi.fn(),
    close: vi.fn(),
  };
});

describe('Logger', () => {
  beforeEach(() => {
    process.env.DSN = 'https://public@sentry.example.com/1';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be able to capture exceptions and log on dev env', () => {
    const errorSpy = vi.spyOn(console, 'error');

    errorSpy.mockImplementationOnce(() => {
      // empty
    });

    Logger.getInstance().logBot(
      new Error('foo bar'),
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(new Error('[bot]: foo bar'));
    expect((captureException as MockedFunction<any>)).toHaveBeenCalledTimes(1);
    expect((captureException as MockedFunction<any>)).toHaveBeenCalledWith(
      new Error('[bot]: foo bar'),
    );
  });

  it('should be able to be closed', async () => {
    await Logger.getInstance().closeLogger();

    expect((close as MockedFunction<any>)).toHaveBeenCalledTimes(1);
  });
});
