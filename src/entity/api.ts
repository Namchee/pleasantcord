// APIResponse represents response from pleasantcord's API server
export interface APIResponse<T> {
  data: T;
  error: string;
}
