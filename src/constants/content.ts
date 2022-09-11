import { ContentType } from '../entity/config.js';

export const CDN = `https://cdn.discordapp.com/emojis`;

// List of supported content MIME types
// Should support all visual contents that also supported
// by Discord.
export const SUPPORTED_CONTENTS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

// Placeholder name for those who doesn't have it
export const PLACEHOLDER_NAME = 'content';

// Content type map to actual MIME type
export const CONTENT_TYPE_MAP: Record<ContentType, string[]> = {
  Image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  Video: ['video/mp4', 'video/webm'],
  Sticker: ['image/png'],
};
