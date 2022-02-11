// List of classifiable content MIME types

export const CLASSIFIABLE_CONTENTS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// List of supported content MIME types
// Should support all visual contents that also supported
// by Discord.
export const SUPPORTED_CONTENTS = [
  ...CLASSIFIABLE_CONTENTS,
  'video/mp4',
  'video/webm',
];

// Placeholder name for those who doesn't have it
export const PLACEHOLDER_NAME = 'content';
