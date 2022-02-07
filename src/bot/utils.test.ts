import { describe, it, afterEach, beforeEach, vi, expect } from 'vitest';
import { Constants, MessageEmbed } from 'discord.js';

import { handleError } from '@/bot/utils';
import { Logger } from '@/utils/logger';
import { RED } from '@/constants/color';

class MockError extends Error {
  public constructor(message: string, public readonly code?: number) {
    super(message);
  }
}

const url = 'foo bar';

describe('handleError', () => {
  beforeEach(() => {
    process.env.DSN = 'https://public@sentry.example.com/1';
    process.env.IMAGE_URL = url;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle unexpected errors', () => {
    const loggerSpy = vi.spyOn(Logger.getInstance(), 'logBot');
    loggerSpy.mockImplementationOnce(() => vi.fn());

    const error = new Error('Unexpected');

    const err = handleError(error);

    const colorCode = parseInt(RED.slice(1), 16);

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(error);
    expect(err).toBeInstanceOf(MessageEmbed);
    expect(err?.author?.name).toBe('pleasantcord');
    expect(err?.author?.iconURL).toBe(url);
    expect(err?.color).toBe(colorCode);
    expect(err?.title).toBe('Ouch!');
    expect(err?.description).toBe(
      "Unfortunately, `pleasantcord` has encountered an unexpected error. Don't worry, the error has been reported to the system and will be resolved as soon as possible.\n\nIf this issue persists, please submit an issue to [GitHub](https://github.com/Namchee/pleasantcord/issues) or join [our support server](https://discord.gg/Pj4aGp8Aky) and submit your bug report on the appropriate channel."
    );
  });

  it('should ignore message deletion error', () => {
    const error = new MockError('foo', Constants.APIErrors.UNKNOWN_MESSAGE);

    const err = handleError(error);

    expect(err).toBeNull();
  });

  it('should handle missing access error', () => {
    const error = new MockError('foo', Constants.APIErrors.MISSING_ACCESS);

    const err = handleError(error);

    const colorCode = parseInt(RED.slice(1), 16);

    expect(err).toBeInstanceOf(MessageEmbed);
    expect(err?.author?.name).toBe('pleasantcord');
    expect(err?.author?.iconURL).toBe(url);
    expect(err?.color).toBe(colorCode);
    expect(err?.title).toBe('Insufficient Permissions');
    expect(err?.description).toBe(
      `\`pleasantcord\` lacks the required permissions to perform its duties`
    );
    expect(err?.fields.length).toBe(1);
  });

  it('should handle missing permissions error', () => {
    const error = new MockError('foo', Constants.APIErrors.MISSING_PERMISSIONS);

    const err = handleError(error);

    const colorCode = parseInt(RED.slice(1), 16);

    expect(err).toBeInstanceOf(MessageEmbed);
    expect(err?.author?.name).toBe('pleasantcord');
    expect(err?.author?.iconURL).toBe(url);
    expect(err?.color).toBe(colorCode);
    expect(err?.title).toBe('Insufficient Permissions');
    expect(err?.description).toBe(
      `\`pleasantcord\` lacks the required permissions to perform its duties`
    );
    expect(err?.fields.length).toBe(1);
  });

  it('should handle OAuth', () => {
    const error = new MockError('foo', Constants.APIErrors.MISSING_OAUTH_SCOPE);

    const err = handleError(error);

    const colorCode = parseInt(RED.slice(1), 16);

    expect(err).toBeInstanceOf(MessageEmbed);
    expect(err?.author?.name).toBe('pleasantcord');
    expect(err?.author?.iconURL).toBe(url);
    expect(err?.color).toBe(colorCode);
    expect(err?.title).toBe('Insufficient Permissions');
    expect(err?.description).toBe(
      `\`pleasantcord\` lacks the required permissions to perform its duties`
    );
    expect(err?.fields.length).toBe(1);
  });
});
