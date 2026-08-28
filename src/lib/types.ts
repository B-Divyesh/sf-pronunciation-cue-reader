export interface Cue {
  id: string;
  site: string;
  term: string;
  sayAs: string;
  scope: 'site' | 'everywhere';
  createdAt: number;
  updatedAt: number;
}

export interface ReaderChunk {
  display: string;
  spoken: string;
  hasCue: boolean;
}

export interface LicenseCache {
  token: string;
  valid: boolean;
  checkedAt: number;
  reason?: string;
}
