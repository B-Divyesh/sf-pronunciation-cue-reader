import './style.css';
import './touch-targets.css';
import { activeCues, createChunks, cueId, FREE_CUE_LIMIT, hasSiteCueCapacity, mergeImportedCues, normalizeSite, parseCueImport, validateCue } from '../../src/lib/glossary';
import type { Cue, ReaderChunk } from '../../src/lib/types';

type PendingSelection = { text: string; url: string; capturedAt: number; openCueForm?: boolean };
const PENDING_SELECTION_TTL = 10 * 60_000;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const state = { cues: [] as Cue[], site: 'this page', text: '', chunks: [] as ReaderChunk[], chunkIndex: -1, reading: false, paused: false, voices: [] as SpeechSynthesisVoice[] };

async function storageGet<T>(key: string): Promise<T | undefined> {
  return (await chrome.storage.local.get(key))[key] as T | undefined;
}

async function loadPageSelection(): Promise<PendingSelection | null> {
  const pending = await storageGet<PendingSelection>('pendingSelection');
  const age = pending ? Date.now() - pending.capturedAt : NaN;
  const isFreshPendingSelection = Boolean(pending && Number.isFinite(age) && age >= 0 && age < PENDING_SELECTION_TTL);
  if (isFreshPendingSelection && pending) {
    await chrome.storage.local.remove('pendingSelection');
    await chrome.action.setBadgeText({ text: '' });
    return pending;
  }
  // Context-menu selections are a short handoff, never durable reading data.
  // Clear malformed, future-dated, and expired values before querying a tab.
  if (pending) {
    await chrome.storage.local.remove('pendingSelection');
    await chrome.action.setBadgeText({ text: '' });
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({ text: window.getSelection()?.toString().trim().slice(0, 12_000) || '', url: location.href, capturedAt: Date.now() })
    });
    return result?.result ?? null;
  } catch {
    showToast('This browser page does not allow extensions. Try a regular website.');
    return null;
  }
}

function showToast(message: string): void {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3000);
}

function renderReader(): void {
  const ready = $('reader-ready');
  const empty = $('selection-empty');
  state.chunks = createChunks(state.text, activeCues(state.cues, state.site));
  ready.hidden = state.chunks.length === 0;
  empty.hidden = state.chunks.length > 0;
  const container = $('chunks');
  container.replaceChildren(...state.chunks.map((chunk, index) => {
    const span = document.createElement('span');
    span.className = `chunk${chunk.hasCue ? ' has-cue' : ''}`;
    span.textContent = `${chunk.display} `;
    span.dataset.index = String(index);
    span.title = chunk.hasCue ? `Will be spoken as: ${chunk.spoken}` : '';
    return span;
  }));
}

function setCurrentChunk(index: number): void {
  document.querySelectorAll<HTMLElement>('.chunk').forEach((item, itemIndex) => {
    const isCurrent = itemIndex === index;
    item.classList.toggle('current', isCurrent);
    // An empty boolean attribute is not a valid ARIA current-item value. Keep
    // the visual lozenge and the accessibility-tree state in lockstep.
    if (isCurrent) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });
  state.chunkIndex = index;
}

function selectedVoice(): SpeechSynthesisVoice | undefined {
  return state.voices.find((voice) => voice.voiceURI === ($<HTMLSelectElement>('voice-select')).value);
}

function speakText(text: string, onEnd?: () => void): void {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectedVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.92;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => { state.reading = false; state.paused = false; setCurrentChunk(-1); updateReadingControls(); showToast('The installed voice could not read that text. Try another voice.'); };
  speechSynthesis.speak(utterance);
}

function readChunk(index: number): void {
  if (!state.reading || index >= state.chunks.length) {
    state.reading = false;
    state.paused = false;
    setCurrentChunk(-1);
    updateReadingControls();
    return;
  }
  const chunk = state.chunks[index];
  if (!chunk) return;
  setCurrentChunk(index);
  speakText(chunk.spoken, () => { if (state.reading) readChunk(index + 1); });
}

function updateReadingControls(): void {
  const button = $<HTMLButtonElement>('read-button');
  button.querySelector('span')!.textContent = state.paused ? 'Resume' : state.reading ? 'Pause' : 'Read aloud';
  ($<HTMLButtonElement>('stop-button')).disabled = !state.reading && state.chunkIndex < 0;
}

function loadVoices(): void {
  state.voices = speechSynthesis.getVoices();
  const select = $<HTMLSelectElement>('voice-select');
  const current = select.value;
  select.replaceChildren(new Option('System default', ''), ...state.voices.map((voice) => new Option(`${voice.name} (${voice.lang})`, voice.voiceURI)));
  select.value = current;
}

function visibleCues(): Cue[] {
  return activeCues(state.cues, state.site);
}

function renderCues(): void {
  const list = $('cue-list');
  const cues = visibleCues();
  $('cue-empty').hidden = cues.length > 0;
  list.replaceChildren(...cues.map((cue) => {
    const li = document.createElement('li');
    const copy = document.createElement('div');
    const term = document.createElement('strong');
    term.textContent = cue.term;
    const replacement = document.createElement('span');
    replacement.textContent = `Say “${cue.sayAs}”${cue.scope === 'everywhere' ? ' · every site' : ''}`;
    copy.append(term, replacement);
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    const edit = document.createElement('button');
    edit.type = 'button'; edit.className = 'icon-button small'; edit.setAttribute('aria-label', `Edit ${cue.term}`); edit.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 16 10-10 3 3L8 19H5v-3z"/></svg>';
    edit.addEventListener('click', () => openCueForm(cue));
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'icon-button small danger'; remove.setAttribute('aria-label', `Delete ${cue.term}`); remove.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 7h10l-1 12H8L7 7zm2-3h6l1 2H8l1-2z"/></svg>';
    remove.addEventListener('click', async () => {
      if (!confirm(`Delete the cue for “${cue.term}”?`)) return;
      state.cues = state.cues.filter((item) => item.id !== cue.id);
      await persistCues(); renderCues(); renderReader(); showToast('Cue deleted.');
    });
    actions.append(edit, remove); li.append(copy, actions); return li;
  }));
}

function openCueForm(cue?: Cue): void {
  const form = $<HTMLFormElement>('cue-form');
  form.hidden = false;
  ($<HTMLInputElement>('cue-id')).value = cue?.id ?? '';
  ($<HTMLInputElement>('term')).value = cue?.term ?? (state.text.split(/\s+/).length <= 5 ? state.text.replace(/[.,!?]+$/, '') : '');
  ($<HTMLInputElement>('say-as')).value = cue?.sayAs ?? '';
  $('cue-error').textContent = '';
  ($<HTMLInputElement>('term')).focus();
}

async function persistCues(): Promise<void> {
  await chrome.storage.local.set({ cues: state.cues });
}

async function saveCue(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const term = ($<HTMLInputElement>('term')).value.trim();
  const sayAs = ($<HTMLInputElement>('say-as')).value.trim();
  const error = validateCue(term, sayAs);
  if (error) { $('cue-error').textContent = error; return; }
  const editingId = ($<HTMLInputElement>('cue-id')).value;
  const existing = state.cues.find((cue) => cue.id === editingId || (!editingId && cue.term.toLocaleLowerCase() === term.toLocaleLowerCase() && cue.site === state.site));
  if (!existing && !hasSiteCueCapacity(state.cues, state.site)) {
    $('cue-error').textContent = `This site glossary holds ${FREE_CUE_LIMIT} cues. Export a backup, delete a cue, or save the cue on another site.`;
    return;
  }
  const now = Date.now();
  const next: Cue = { id: existing?.id ?? cueId(term, state.site), term, sayAs, site: state.site, scope: 'site', createdAt: existing?.createdAt ?? now, updatedAt: now };
  state.cues = state.cues.filter((cue) => cue.id !== existing?.id && !(cue.term.toLocaleLowerCase() === term.toLocaleLowerCase() && cue.site === state.site));
  state.cues.push(next); await persistCues(); ($<HTMLFormElement>('cue-form')).hidden = true; renderCues(); renderReader(); showToast('Cue saved on this device.');
}

async function init(): Promise<void> {
  const storedCues = (await storageGet<Cue[]>('cues')) ?? [];
  const migratedCues = storedCues.map((cue) => cue.scope === 'everywhere' ? { ...cue, scope: 'site' as const } : cue);
  state.cues = migratedCues;
  if (migratedCues.some((cue, index) => cue !== storedCues[index])) await persistCues();
  await chrome.storage.local.remove(['sb_license:pronunciation-cue-reader', 'sb_license:pronunciation-cue-reader:verdict']);
  const selection = await loadPageSelection();
  if (selection) { state.text = selection.text; state.site = normalizeSite(selection.url); }
  $('site-pill').textContent = state.site;
  renderReader(); renderCues(); loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
  if (selection?.openCueForm) openCueForm();
}

$('retry-selection').addEventListener('click', async () => { const result = await loadPageSelection(); if (result?.text) { state.text = result.text; state.site = normalizeSite(result.url); $('site-pill').textContent = state.site; renderReader(); renderCues(); } else showToast('No selected text found yet.'); });
$('read-button').addEventListener('click', () => {
  if (state.reading) {
    if (state.paused) {
      speechSynthesis.resume();
      state.paused = false;
    } else {
      speechSynthesis.pause();
      state.paused = true;
    }
    updateReadingControls();
    return;
  }
  state.reading = true;
  state.paused = false;
  updateReadingControls();
  readChunk(Math.max(0, state.chunkIndex));
});
$('stop-button').addEventListener('click', () => { state.reading = false; state.paused = false; speechSynthesis.cancel(); setCurrentChunk(-1); updateReadingControls(); });
$('new-cue').addEventListener('click', () => openCueForm());
$('use-first-word').addEventListener('click', () => openCueForm());
$('cancel-cue').addEventListener('click', () => { ($<HTMLFormElement>('cue-form')).hidden = true; });
$('cue-form').addEventListener('submit', (event) => void saveCue(event as SubmitEvent));
$('preview-cue').addEventListener('click', () => { const value = ($<HTMLInputElement>('say-as')).value.trim(); value ? speakText(value) : ($('cue-error').textContent = 'Enter how the term should sound first.'); });
$('export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify(state.cues, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `say-it-right-cues-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); showToast('Glossary exported.'); });
$<HTMLInputElement>('import-file').addEventListener('change', async (event) => {
  const file = (event.currentTarget as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const result = mergeImportedCues(state.cues, parseCueImport(await file.text()));
    state.cues = result.cues;
    await persistCues();
    renderCues();
    renderReader();
    const skipped: string[] = [];
    if (result.skippedForUnsupportedScope) skipped.push(`${result.skippedForUnsupportedScope} every-site cue${result.skippedForUnsupportedScope === 1 ? ' uses' : 's use'} an unsupported every-site scope`);
    if (result.skippedForLimit) skipped.push(`${result.skippedForLimit} cue${result.skippedForLimit === 1 ? '' : 's'} exceed${result.skippedForLimit === 1 ? 's' : ''} the ${FREE_CUE_LIMIT}-cue free limit`);
    showToast(skipped.length ? `${result.imported} imported; ${skipped.join('; ')}.` : `${result.imported} cue${result.imported === 1 ? '' : 's'} imported.`);
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'That backup could not be imported.');
  }
});
window.addEventListener('unload', () => speechSynthesis.cancel());
void init();
