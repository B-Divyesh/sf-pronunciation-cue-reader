import { activeCues, createChunks, cueId, normalizeSite, validateCue } from '../../src/lib/glossary';
import type { Cue } from '../../src/lib/types';
import './touch-targets.css';
import './demo.css';

const DEMO_CUES_KEY = 'demo:pronunciation-cue-reader:cues';
const DEMO_SITE = 'docs.example.org';
const SAMPLE_TEXT = 'The Kubernetes team stores release notes in PostgreSQL. NASA keeps a glossary for new contributors.';
const initialCues = (): Cue[] => ([
  ['Kubernetes', 'koo-ber-net-ees'],
  ['PostgreSQL', 'post-gress cue ell'],
  ['NASA', 'N A S A']
] as const).map(([term, sayAs], index) => ({ id: cueId(term, DEMO_SITE), term, sayAs, site: DEMO_SITE, scope: 'site', createdAt: index + 1, updatedAt: index + 1 }));

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let cues: Cue[] = [];

function loadDemo(): Cue[] {
  try {
    const saved = localStorage.getItem(DEMO_CUES_KEY);
    if (!saved) return initialCues();
    const parsed = JSON.parse(saved) as Cue[];
    return Array.isArray(parsed) ? parsed.filter((cue) => cue.site === DEMO_SITE && cue.scope === 'site') : initialCues();
  } catch {
    return initialCues();
  }
}

function persistDemo(): void {
  localStorage.setItem(DEMO_CUES_KEY, JSON.stringify(cues));
}

function renderDemo(): void {
  const sampleCues = activeCues(cues, DEMO_SITE);
  const passage = $('demo-passage');
  passage.replaceChildren(...createChunks(SAMPLE_TEXT, sampleCues).map((chunk) => {
    const span = document.createElement('span');
    span.className = `demo-chunk${chunk.hasCue ? ' has-cue' : ''}`;
    span.textContent = `${chunk.display} `;
    if (chunk.hasCue) {
      span.title = `Will be spoken as: ${chunk.spoken}`;
      span.dataset.spoken = chunk.spoken;
    }
    return span;
  }));
  $('demo-cue-list').replaceChildren(...sampleCues.map((cue) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong></strong><span></span>`;
    item.querySelector('strong')!.textContent = cue.term;
    item.querySelector('span')!.textContent = `Will be spoken as: ${cue.sayAs}`;
    return item;
  }));
}

function readSample(): void {
  const spoken = createChunks(SAMPLE_TEXT, activeCues(cues, DEMO_SITE)).map((chunk) => chunk.spoken).join(' ');
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(spoken));
  $('demo-reader-status').textContent = 'Reading the sample with its saved cues.';
}

function resetDemo(): void {
  localStorage.removeItem(DEMO_CUES_KEY);
  cues = initialCues();
  persistDemo();
  renderDemo();
  $('demo-reader-status').textContent = 'Demo reset. The original sample cues are ready.';
}

cues = loadDemo();
persistDemo();
renderDemo();

$<HTMLButtonElement>('read-sample').addEventListener('click', readSample);
$<HTMLButtonElement>('reset-demo').addEventListener('click', resetDemo);
$<HTMLAnchorElement>('start-real').addEventListener('click', () => localStorage.removeItem(DEMO_CUES_KEY));
$<HTMLFormElement>('demo-cue-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const term = $<HTMLInputElement>('demo-term').value.trim();
  const sayAs = $<HTMLInputElement>('demo-say-as').value.trim();
  const error = validateCue(term, sayAs);
  if (error) {
    $('demo-error').textContent = error;
    return;
  }
  const matching = cues.find((cue) => cue.term.toLocaleLowerCase() === term.toLocaleLowerCase());
  const now = Date.now();
  cues = cues.filter((cue) => cue.id !== matching?.id);
  cues.push({ id: matching?.id ?? cueId(term, normalizeSite(DEMO_SITE)), term, sayAs, site: DEMO_SITE, scope: 'site', createdAt: matching?.createdAt ?? now, updatedAt: now });
  persistDemo();
  renderDemo();
  $<HTMLInputElement>('demo-term').value = '';
  $<HTMLInputElement>('demo-say-as').value = '';
  $('demo-error').textContent = '';
  $('demo-reader-status').textContent = `Saved the sample cue for ${term}.`;
});
