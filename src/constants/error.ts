import { RESTJSONErrorCodes } from 'discord.js';

// Permission related errors
export const PERMISSION_ERRORS: number[] = [
  RESTJSONErrorCodes.MissingAccess,
  RESTJSONErrorCodes.MissingPermissions,
  RESTJSONErrorCodes.MissingRequiredOAuth2Scope,
];
