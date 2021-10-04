import { Constants } from 'discord.js';

// Permission related errors
export const PERMISSION_ERRORS: number[] = [
  Constants.APIErrors.MISSING_ACCESS,
  Constants.APIErrors.MISSING_PERMISSIONS,
  Constants.APIErrors.MISSING_OAUTH_SCOPE,
];
