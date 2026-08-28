import { describe, expect, it } from 'vitest';
import { activeCues, createChunks, FREE_CUE_LIMIT, mergeImportedCues, normalizeSite, parseCueImport, replaceCues, validateCue } from '../src/lib/glossary';
import type { Cue } from '../src/lib/types';

const cue = (term: string, sayAs: string, site = 'example.com', scope: Cue['scope'] = 'site'): Cue => ({
  id: term, term, sayAs, site, scope, createdAt: 1, updatedAt: 1
});

describe('glossary', () => {
  it('normalizes a page to its hostname', () => expect(normalizeSite('https://www.Example.com/path')).toBe('example.com'));
  it('uses the longest matching cue first', () => {
    const result = replaceCues('Read PostgreSQL now.', [cue('SQL', 'sequel'), cue('PostgreSQL', 'post-gress cue ell')]);
    expect(result).toEqual({ spoken: 'Read post-gress cue ell now.', hasCue: true });
  });
  it('keeps site cues local while including global cues', () => {
    expect(activeCues([cue('A', 'a'), cue('B', 'b', 'other.test'), cue('C', 'c', 'other.test', 'everywhere')], 'example.com').map((c) => c.term)).toEqual(['A', 'C']);
  });
  it('chunks long text and keeps source text separate from spoken text', () => {
    const chunks = createChunks('I use Kubernetes every day. It works.', [cue('Kubernetes', 'koo-ber-net-ees')], 5);
    expect(chunks[0]).toEqual({ display: 'I use Kubernetes every day.', spoken: 'I use koo-ber-net-ees every day.', hasCue: true });
    expect(chunks).toHaveLength(2);
  });
  it('validates and imports portable backups', () => {
    expect(validateCue('', 'x')).toMatch(/Enter/);
    expect(parseCueImport(JSON.stringify([{ term: 'Nguyen', sayAs: 'nwin', site: 'https://example.com' }]))[0]!.site).toBe('example.com');
  });
  it('enforces free limits and Plus-only global scope while importing', () => {
    const existing = [cue('Saved', 'saved')];
    const imported = [
      ...Array.from({ length: FREE_CUE_LIMIT + 3 }, (_, index) => cue(`Term ${index}`, `term ${index}`)),
      cue('Everywhere', 'everywhere', 'example.com', 'everywhere')
    ];
    const result = mergeImportedCues(existing, imported, false);
    expect(result.cues).toHaveLength(FREE_CUE_LIMIT);
    expect(result.cues.some((item) => item.scope === 'everywhere')).toBe(false);
    expect(result).toMatchObject({ imported: FREE_CUE_LIMIT - 1, skippedForLimit: 4, skippedForPlusScope: 1 });
  });
  it('allows Plus imports and treats an existing id as an update, not extra capacity', () => {
    const existing = [cue('Saved', 'old')];
    const replacement = { ...cue('Saved', 'new'), id: existing[0]!.id };
    const global = cue('Everywhere', 'everywhere', 'example.com', 'everywhere');
    const result = mergeImportedCues(existing, [replacement, global], true);
    expect(result).toMatchObject({ imported: 2, skippedForLimit: 0, skippedForPlusScope: 0 });
    expect(result.cues).toHaveLength(2);
    expect(result.cues.find((item) => item.id === existing[0]!.id)?.sayAs).toBe('new');
  });
});
