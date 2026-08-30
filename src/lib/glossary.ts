import type { Cue, ReaderChunk } from './types';

export const FREE_CUE_LIMIT = 20;

export type ImportMergeResult = {
  cues: Cue[];
  imported: number;
  skippedForLimit: number;
  skippedForUnsupportedScope: number;
};

export function normalizeSite(input: string): string {
  if (!input) return 'this page';
  try {
    const url = new URL(input);
    return url.hostname.replace(/^www\./, '') || 'this page';
  } catch {
    return input.replace(/^www\./, '').toLocaleLowerCase() || 'this page';
  }
}

export function activeCues(cues: Cue[], site: string): Cue[] {
  const normalized = normalizeSite(site);
  return cues
    .filter((cue) => cue.site === normalized)
    .sort((a, b) => b.term.length - a.term.length);
}

export function replaceCues(text: string, cues: Cue[]): { spoken: string; hasCue: boolean } {
  let spoken = text;
  let hasCue = false;
  for (const cue of cues) {
    if (!cue.term.trim()) continue;
    const escaped = cue.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordLike = /^[\p{L}\p{N}_-]+$/u.test(cue.term);
    const pattern = new RegExp(`${wordLike ? '\\b' : ''}${escaped}${wordLike ? '\\b' : ''}`, 'giu');
    if (pattern.test(spoken)) {
      hasCue = true;
      spoken = spoken.replace(pattern, cue.sayAs);
    }
  }
  return { spoken, hasCue };
}

export function createChunks(text: string, cues: Cue[], maxWords = 12): ReaderChunk[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [clean];
  const displayChunks: string[] = [];
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    for (let index = 0; index < words.length; index += maxWords) {
      displayChunks.push(words.slice(index, index + maxWords).join(' '));
    }
  }
  return displayChunks.map((display) => ({ display, ...replaceCues(display, cues) }));
}

export function cueId(term: string, site: string): string {
  return `${normalizeSite(site)}:${term.trim().toLocaleLowerCase()}`;
}

export function validateCue(term: string, sayAs: string): string | null {
  if (!term.trim()) return 'Enter the word or phrase as it appears.';
  if (!sayAs.trim()) return 'Enter how you want it spoken.';
  if (term.trim().length > 120 || sayAs.trim().length > 180) return 'Keep the cue under 120 characters and the spoken form under 180.';
  return null;
}

export function parseCueImport(value: string): Cue[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('The backup must contain a list of cues.');
  return parsed.map((item) => {
    const cue = item as Partial<Cue>;
    if (!cue.term || !cue.sayAs || !cue.site) throw new Error('One or more cues are missing a term, spoken form, or site.');
    const validationError = validateCue(cue.term, cue.sayAs);
    if (validationError) throw new Error(`One or more cues are invalid: ${validationError}`);
    return {
      id: cue.id || cueId(cue.term, cue.site),
      term: cue.term,
      sayAs: cue.sayAs,
      site: normalizeSite(cue.site),
      scope: cue.scope === 'everywhere' ? 'everywhere' : 'site',
      createdAt: cue.createdAt || Date.now(),
      updatedAt: Date.now()
    };
  });
}

/** Merge a portable backup while keeping this version's per-site cue boundary. */
export function mergeImportedCues(existing: Cue[], imported: Cue[]): ImportMergeResult {
  const next = new Map(existing.map((cue) => [cue.id, cue]));
  let importedCount = 0;
  let skippedForLimit = 0;
  let skippedForUnsupportedScope = 0;

  for (const cue of imported) {
    if (cue.scope === 'everywhere') {
      skippedForUnsupportedScope += 1;
      continue;
    }
    if (!next.has(cue.id) && next.size >= FREE_CUE_LIMIT) {
      skippedForLimit += 1;
      continue;
    }
    next.set(cue.id, cue);
    importedCount += 1;
  }

  return { cues: [...next.values()], imported: importedCount, skippedForLimit, skippedForUnsupportedScope };
}
