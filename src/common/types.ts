export interface ImageClass {
  className: string;
  probability: number;
}

export interface SFWVerdict {
  isSFW: boolean;
  reason?: string;
  confidence?: number;
}
