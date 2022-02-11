import { describe, it, afterEach, beforeEach, vi, expect } from 'vitest';
import { Constants, Message, MessageEmbed } from 'discord.js';

import { getCommand, getSupportedContents, handleError } from '@/bot/utils';
import { Logger } from '@/utils/logger';
import { RED } from '@/constants/color';
import { PLACEHOLDER_NAME } from '@/constants/content';

// Disable threads in unit test
vi.mock('threads', () => {
  return {
    Pool: vi.fn(),
    Worker: vi.fn(),
  };
});

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

describe('getCommand', () => {
  it('should return actual command', () => {
    const msg = 'pc!help';
    const cmd = getCommand(msg);

    expect(cmd).toBe('help');
  });

  it('should get the first argument only', () => {
    const msg = 'pc!help lorem ipsum';
    const cmd = getCommand(msg);

    expect(cmd).toBe('help');
  });
});

describe('getSupportedContents', () => {
  it('should get all supported attachments', () => {
    const msg = {
      attachments: new Map([
        [
          '123',
          {
            url: 'foo',
            name: 'bar',
            contentType: 'image/jpeg',
          },
        ],
        [
          '233',
          {
            url: 'lorem',
            name: 'ipsum',
            contentType: 'image/png',
          },
        ],
        [
          '42352345',
          {
            url: 'a',
            name: 'b',
            contentType: 'video/mkv',
          },
        ],
        [
          '234312412341234',
          {
            url: 'c',
            name: 'd',
            contentType: '',
          },
        ],
      ]),
      embeds: [],
    } as unknown as Message;

    const contents = getSupportedContents(msg);

    expect(contents.length).toBe(2);
    expect(contents).toContainEqual({
      name: 'bar',
      url: 'foo',
    });
    expect(contents).toContainEqual({
      name: 'ipsum',
      url: 'lorem',
    });
  });

  it('should get all supported embeds', () => {
    const msg = {
      embeds: [
        new MessageEmbed({
          video: {
            url: 'foo',
          },
          image: {
            url: 'wrong',
          },
        }),
        new MessageEmbed({
          image: {
            url: 'bar',
          },
        }),
        new MessageEmbed({
          thumbnail: {
            url: 'baz',
          },
        }),
        new MessageEmbed({
          url: 'caz',
        }),
        new MessageEmbed(),
      ],
      attachments: new Map(),
    } as unknown as Message;

    const contents = getSupportedContents(msg);

    expect(contents.length).toBe(4);
    expect(contents).toContainEqual({
      name: PLACEHOLDER_NAME,
      url: 'foo',
    });
    expect(contents).toContainEqual({
      name: PLACEHOLDER_NAME,
      url: 'bar',
    });
    expect(contents).toContainEqual({
      name: PLACEHOLDER_NAME,
      url: 'baz',
    });
    expect(contents).toContainEqual({
      name: PLACEHOLDER_NAME,
      url: 'caz',
    });
  });
});
