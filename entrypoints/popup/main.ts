import './style.css';
import { activeCues, createChunks, cueId, FREE_CUE_LIMIT, normalizeSite, parseCueImport, validateCue } from '../../src/lib/glossary';
import { LICENSE_CACHE_KEY, LICENSE_KEY, recentValidLicense, verifyLicense } from '../../src/lib/license';
import type { Cue, LicenseCache, ReaderChunk } from '../../src/lib/types';

type PendingSelection = { text: string; url: string; capturedAt: number; openCueForm?: boolean };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const state = { cues: [] as Cue[], site: 'this page', text: '', chunks: [] as ReaderChunk[], chunkIndex: -1, reading: false, voices: [] as SpeechSynthesisVoice[], plus: false };

async function storageGet<T>(key: string): Promise<T | undefined> {
  return (await chrome.storage.local.get(key))[key] as T | undefined;
}

async function loadPageSelection(): Promise<PendingSelection | null> {
  const pending = await storageGet<PendingSelection>('pendingSelection');
  if (pending && Date.now() - pending.capturedAt < 10 * 60_000) {
    await chrome.storage.local.remove('pendingSelection');
    await chrome.action.setBadgeText({ text: '' });
    return pending;
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
    item.classList.toggle('current', itemIndex === index);
    item.toggleAttribute('aria-current', itemIndex === index);
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
  utterance.onerror = () => { state.reading = false; updateReadingControls(); showToast('The installed voice could not read that text. Try another voice.'); };
  speechSynthesis.speak(utterance);
}

function readChunk(index: number): void {
  if (!state.reading || index >= state.chunks.length) {
    state.reading = false;
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
  button.querySelector('span')!.textContent = state.reading ? 'Pause' : 'Read aloud';
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
  ($<HTMLInputElement>('global-scope')).checked = cue?.scope === 'everywhere';
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
  const wantsGlobal = ($<HTMLInputElement>('global-scope')).checked;
  if (wantsGlobal && !state.plus) { $('cue-error').textContent = 'Every-site cues are included with Plus. Site cues stay free.'; return; }
  const editingId = ($<HTMLInputElement>('cue-id')).value;
  if (!editingId && state.cues.length >= FREE_CUE_LIMIT && !state.plus) {
    $('cue-error').textContent = `The free glossary holds ${FREE_CUE_LIMIT} cues. Export remains free, or unlock Plus for unlimited cues.`;
    return;
  }
  const now = Date.now();
  const existing = state.cues.find((cue) => cue.id === editingId);
  const next: Cue = { id: editingId || cueId(term, wantsGlobal ? '*' : state.site), term, sayAs, site: state.site, scope: wantsGlobal ? 'everywhere' : 'site', createdAt: existing?.createdAt ?? now, updatedAt: now };
  state.cues = state.cues.filter((cue) => cue.id !== editingId && !(cue.term.toLocaleLowerCase() === term.toLocaleLowerCase() && cue.site === state.site));
  state.cues.push(next); await persistCues(); ($<HTMLFormElement>('cue-form')).hidden = true; renderCues(); renderReader(); showToast('Cue saved on this device.');
}

async function loadLicense(): Promise<void> {
  const cache = await storageGet<LicenseCache>(LICENSE_CACHE_KEY);
  const token = await storageGet<string>(LICENSE_KEY);
  state.plus = recentValidLicense(cache ?? null) || Boolean(cache?.valid && token);
  updatePlus(cache);
  if (token && (!cache || Date.now() - cache.checkedAt >= 86_400_000)) {
    try { const verdict = await verifyLicense(token); await chrome.storage.local.set({ [LICENSE_CACHE_KEY]: verdict }); state.plus = verdict.valid; updatePlus(verdict); }
    catch { $('license-status').textContent = state.plus ? 'Plus active. Offline verification will retry later.' : 'Could not verify while offline. The free reader still works.'; }
  }
}

function updatePlus(cache?: LicenseCache | null): void {
  $('license-status').textContent = state.plus ? 'Plus is active on this device.' : cache && !cache.valid ? 'This license is no longer active. You can continue with the free reader.' : '';
  ($<HTMLInputElement>('global-scope')).disabled = !state.plus;
}

async function init(): Promise<void> {
  state.cues = (await storageGet<Cue[]>('cues')) ?? [];
  await loadLicense();
  const selection = await loadPageSelection();
  if (selection) { state.text = selection.text; state.site = normalizeSite(selection.url); }
  $('site-pill').textContent = state.site;
  renderReader(); renderCues(); loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
  if (selection?.openCueForm) openCueForm();
}

$('retry-selection').addEventListener('click', async () => { const result = await loadPageSelection(); if (result?.text) { state.text = result.text; state.site = normalizeSite(result.url); $('site-pill').textContent = state.site; renderReader(); renderCues(); } else showToast('No selected text found yet.'); });
$('read-button').addEventListener('click', () => { if (state.reading) { state.reading = false; speechSynthesis.cancel(); updateReadingControls(); return; } state.reading = true; updateReadingControls(); readChunk(Math.max(0, state.chunkIndex)); });
$('stop-button').addEventListener('click', () => { state.reading = false; speechSynthesis.cancel(); setCurrentChunk(-1); updateReadingControls(); });
$('new-cue').addEventListener('click', () => openCueForm());
$('use-first-word').addEventListener('click', () => openCueForm());
$('cancel-cue').addEventListener('click', () => { ($<HTMLFormElement>('cue-form')).hidden = true; });
$('cue-form').addEventListener('submit', (event) => void saveCue(event as SubmitEvent));
$('preview-cue').addEventListener('click', () => { const value = ($<HTMLInputElement>('say-as')).value.trim(); value ? speakText(value) : ($('cue-error').textContent = 'Enter how the term should sound first.'); });
$('export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify(state.cues, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `say-it-right-cues-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); showToast('Glossary exported.'); });
$<HTMLInputElement>('import-file').addEventListener('change', async (event) => { const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return; try { const imported = parseCueImport(await file.text()); const byId = new Map([...state.cues, ...imported].map((cue) => [cue.id, cue])); state.cues = [...byId.values()]; await persistCues(); renderCues(); renderReader(); showToast(`${imported.length} cues imported.`); } catch (error) { showToast(error instanceof Error ? error.message : 'That backup could not be imported.'); } });
$('license-button').addEventListener('click', async () => { const token = ($<HTMLInputElement>('license-input')).value.trim(); if (!token) { $('license-status').textContent = 'Paste your license token first.'; return; } $('license-status').textContent = 'Checking license…'; try { const verdict = await verifyLicense(token); await chrome.storage.local.set({ [LICENSE_KEY]: token, [LICENSE_CACHE_KEY]: verdict }); state.plus = verdict.valid; updatePlus(verdict); if (verdict.valid) ($<HTMLInputElement>('license-input')).value = ''; } catch { $('license-status').textContent = 'Could not verify right now. Check your connection and try again.'; } });
window.addEventListener('unload', () => speechSynthesis.cancel());
void init();
