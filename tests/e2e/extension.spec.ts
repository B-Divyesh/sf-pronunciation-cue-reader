import { test, expect, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { CONTEXT_MENU_ID, CONTEXT_MENU_TITLE, handleSelectionContextMenu } from '../../src/lib/context-menu';

test('@claim:site-cue-limit @claim:keyboard-reader extension popup supports a keyboard-friendly cue flow', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium smoke test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    await worker.evaluate(async () => {
      const oneSiteCues = Array.from({ length: 20 }, (_, index) => ({
        id: `one.example:term-${index}`,
        term: `Term ${index}`,
        sayAs: `term ${index}`,
        site: 'one.example',
        scope: 'site',
        createdAt: index,
        updatedAt: index
      }));
      await chrome.storage.local.set({
        cues: oneSiteCues,
        pendingSelection: {
          text: 'PostgreSQL needs a cue.',
          url: 'https://two.example/guide',
          capturedAt: Date.now()
        }
      });
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page.getByRole('heading', { level: 1, name: 'Read this selection' })).toBeVisible();
    await expect(page.locator('#site-pill')).toHaveText('two.example');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '#main');
    await page.getByRole('button', { name: 'Add cue', exact: true }).focus();
    await expect(page.locator(':focus')).toHaveAttribute('id', 'new-cue');
    expect((await page.getByRole('button', { name: 'Add cue', exact: true }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Enter');
    await page.getByLabel('Word or phrase').fill('Kubernetes');
    await page.getByLabel('Say it like').fill('koo-ber-net-ees');
    await page.getByRole('button', { name: 'Save cue' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Kubernetes', { exact: true })).toBeVisible();
    expect((await page.getByRole('button', { name: 'Edit Kubernetes' }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect((await page.getByRole('button', { name: 'Delete Kubernetes' }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    let saved = await worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues);
    expect(saved.filter((item: { site: string }) => item.site === 'one.example')).toHaveLength(20);
    expect(saved.filter((item: { site: string }) => item.site === 'two.example')).toHaveLength(1);

    await page.locator('.tools summary').click();
    const backup: Array<{ term: string; sayAs: string; site: string }> = Array.from({ length: 21 }, (_, index) => ({ term: `Imported ${index}`, sayAs: `imported ${index}`, site: 'three.example' }));
    await page.locator('#import-file').setInputFiles({ name: 'cue-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(page.locator('#toast')).toContainText('20 imported; 1 cue exceeds the 20-cue free limit.');
    saved = await worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues);
    expect(saved).toHaveLength(41);
    expect(saved.filter((item: { site: string }) => item.site === 'three.example')).toHaveLength(20);
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('@claim:local-reader-data @claim:selected-reading active reading exposes its current chunk and genuinely pauses and resumes', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium smoke test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({
        cues: [{
          id: 'docs.example.org:Kubernetes',
          term: 'Kubernetes',
          sayAs: 'koo-ber-net-ees',
          site: 'docs.example.org',
          scope: 'site',
          createdAt: 1,
          updatedAt: 1
        }],
        pendingSelection: {
          text: 'Kubernetes helps PostgreSQL.',
          url: 'https://docs.example.org/guide',
          capturedAt: Date.now()
        }
      });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));
    await page.addInitScript(() => {
      const calls: string[] = [];
      const speech = new EventTarget() as EventTarget & SpeechSynthesis;
      Object.assign(speech, {
        cancel: () => calls.push('cancel'),
        getVoices: () => [],
        pause: () => calls.push('pause'),
        resume: () => calls.push('resume'),
        speak: () => calls.push('speak')
      });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech });
      Object.defineProperty(window, '__sayItRightSpeechCalls', { configurable: true, value: calls });
    });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page.locator('.chunk')).toHaveCount(1);
    await expect(page.locator('.chunk')).toHaveAttribute('title', 'Will be spoken as: koo-ber-net-ees helps PostgreSQL.');
    await page.getByRole('button', { name: 'Read aloud' }).click();
    const currentChunk = page.locator('.chunk.current');
    await expect(currentChunk).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();

    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __sayItRightSpeechCalls: string[] }).__sayItRightSpeechCalls)).toContain('pause');

    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __sayItRightSpeechCalls: string[] }).__sayItRightSpeechCalls)).toContain('resume');

    await page.getByRole('button', { name: 'Stop reading' }).click();
    await expect(page.locator('.chunk.current')).toHaveCount(0);
    await expect(page.locator('.chunk')).not.toHaveAttribute('aria-current');
    await expect(page.getByRole('button', { name: 'Read aloud' })).toBeVisible();
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  } finally {
    await context.close();
  }
});

test('@claim:backup-export exports a user-requested JSON backup without a network request', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium smoke test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Add cue' }).click();
    await page.getByLabel('Word or phrase').fill('Nguyen');
    await page.getByLabel('Say it like').fill('nwin');
    await page.getByRole('button', { name: 'Save cue' }).click();
    await page.locator('.tools summary').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click()
    ]);
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    expect(JSON.parse(readFileSync(downloadPath!, 'utf8'))).toEqual(expect.arrayContaining([
      expect.objectContaining({ term: 'Nguyen', sayAs: 'nwin' })
    ]));
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  } finally {
    await context.close();
  }
});

test('@claim:portable-backup-import imports a portable JSON backup into extension-local storage', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium import test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({
        pendingSelection: {
          text: 'Read PostgreSQL with a saved cue.',
          url: 'https://docs.example.org/guide',
          capturedAt: Date.now()
        }
      });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.locator('.tools summary').click();
    await page.locator('#import-file').setInputFiles({
      name: 'portable-cues.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify([{
        id: 'docs.example.org:PostgreSQL',
        term: 'PostgreSQL',
        sayAs: 'post-gress cue ell',
        site: 'https://docs.example.org/guide',
        scope: 'site',
        createdAt: 1,
        updatedAt: 1
      }]))
    });
    await expect(page.locator('#toast')).toHaveText('1 cue imported.');
    await expect(page.locator('#cue-list')).toContainText('PostgreSQL');
    await expect.poll(() => worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues)).toEqual([
      expect.objectContaining({
        id: 'docs.example.org:PostgreSQL',
        term: 'PostgreSQL',
        sayAs: 'post-gress cue ell',
        site: 'docs.example.org',
        scope: 'site'
      })
    ]);
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  } finally {
    await context.close();
  }
});

test('@claim:whole-words-and-phrases matches full phrases and abbreviations without changing partial words', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium matching test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({
        cues: [
          { id: 'docs.example.org:kubernetes team', term: 'Kubernetes team', sayAs: 'koo-ber-net-ees team', site: 'docs.example.org', scope: 'site', createdAt: 1, updatedAt: 1 },
          { id: 'docs.example.org:nasa', term: 'NASA', sayAs: 'N A S A', site: 'docs.example.org', scope: 'site', createdAt: 2, updatedAt: 2 },
          { id: 'docs.example.org:nas', term: 'NAS', sayAs: 'network storage', site: 'docs.example.org', scope: 'site', createdAt: 3, updatedAt: 3 }
        ],
        pendingSelection: {
          text: 'The Kubernetes team consulted NASA, not NASAware.',
          url: 'https://docs.example.org/guide',
          capturedAt: Date.now()
        }
      });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page.locator('.chunk')).toHaveAttribute('title', 'Will be spoken as: The koo-ber-net-ees team consulted N A S A, not NASAware.');
    await expect(page.locator('.chunk')).toContainText('The Kubernetes team consulted NASA, not NASAware.');
  } finally {
    await context.close();
  }
});

test('@claim:active-tab-boundary has no broad page access before an explicit reader action', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium permission-boundary test.');
  const manifest = JSON.parse(readFileSync('dist/extension/manifest.json', 'utf8')) as {
    content_scripts?: unknown;
    host_permissions?: string[];
    optional_host_permissions?: string[];
    permissions?: string[];
  };
  expect(manifest.host_permissions ?? []).toEqual([]);
  expect(manifest.optional_host_permissions ?? []).toEqual([]);
  expect(manifest.content_scripts).toBeUndefined();
  expect(manifest.permissions).toEqual(expect.arrayContaining(['activeTab', 'storage', 'contextMenus', 'scripting']));

  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    const storedBeforeAction = await worker.evaluate(async () => chrome.storage.local.get(['pendingSelection', 'cues']));
    expect(storedBeforeAction).toEqual({});
    const injectionResult = await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) return { allowed: false, message: 'No active tab was available for the permission check.' };
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => document.body.textContent });
        return { allowed: true, message: '' };
      } catch (error) {
        return { allowed: false, message: error instanceof Error ? error.message : String(error) };
      }
    });
    expect(injectionResult.allowed).toBe(false);
    expect(injectionResult.message).toMatch(/permission|access|host/i);
  } finally {
    await context.close();
  }
});

test('opened Backup panel remains accessible with 44px navigation targets in dark mode', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium smoke test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.locator('.tools summary').click();

    for (const locator of [
      page.getByRole('link', { name: 'Say It Right website' }),
      page.getByRole('link', { name: 'Privacy' })
    ]) {
      await expect(locator).toBeVisible();
      expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  } finally {
    await context.close();
  }
});

test('maximum-length unbroken cues stay inside a 390px popup', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium smoke test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    const term = 'X'.repeat(120);
    const sayAs = 'Y'.repeat(180);
    await page.getByRole('button', { name: 'Add cue' }).click();
    await page.locator('#term').fill(term);
    await page.locator('#say-as').fill(sayAs);
    await page.getByRole('button', { name: 'Save cue' }).click();
    await expect(page.getByText(term, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    expect((await page.getByRole('button', { name: `Edit ${term}` }).boundingBox())?.x).toBeLessThan(390);
  } finally {
    await context.close();
  }
});

test('@claim:pending-selection-expiry expired selected passages are deleted before the popup falls back to the active tab', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium smoke test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({
        pendingSelection: {
          text: 'This selected passage must expire.',
          url: 'https://docs.example.org/guide',
          capturedAt: Date.now() - 11 * 60_000,
          openCueForm: true
        }
      });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect.poll(() => worker.evaluate(async () => (await chrome.storage.local.get('pendingSelection')).pendingSelection)).toBeUndefined();
  } finally {
    await context.close();
  }
});

test('@claim:installed-voice-preview previews a cue with the chosen installed voice', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium voice test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({ pendingSelection: { text: 'Preview PostgreSQL.', url: 'https://docs.example.org/guide', capturedAt: Date.now() } });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.addInitScript(() => {
      const calls: Array<{ text: string; voiceURI?: string }> = [];
      const voice = { default: true, lang: 'en-GB', localService: true, name: 'Local test voice', voiceURI: 'local-test-voice' } as SpeechSynthesisVoice;
      class TestUtterance extends EventTarget {
        text: string;
        voice: SpeechSynthesisVoice | null = null;
        rate = 1;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(text: string) { super(); this.text = text; }
      }
      const speech = new EventTarget() as EventTarget & SpeechSynthesis;
      Object.assign(speech, {
        cancel: () => undefined,
        getVoices: () => [voice],
        pause: () => undefined,
        resume: () => undefined,
        speak: (utterance: SpeechSynthesisUtterance) => calls.push({ text: utterance.text, voiceURI: utterance.voice?.voiceURI })
      });
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: TestUtterance });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech });
      Object.defineProperty(window, '__sayItRightVoiceCalls', { configurable: true, value: calls });
    });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Add cue', exact: true }).click();
    await page.getByLabel('Say it like').fill('post-gress cue ell');
    await page.getByLabel('Voice').selectOption('local-test-voice');
    await page.getByRole('button', { name: 'Preview pronunciation' }).click();
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __sayItRightVoiceCalls: Array<{ text: string; voiceURI?: string }> }).__sayItRightVoiceCalls)).toEqual([
      { text: 'post-gress cue ell', voiceURI: 'local-test-voice' }
    ]);
  } finally {
    await context.close();
  }
});

test('@claim:installed-extension-offline reads and saves a cue with the browser offline', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium offline test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({
        pendingSelection: {
          text: 'Kubernetes stays available offline.',
          url: 'https://offline.example/guide',
          capturedAt: Date.now()
        }
      });
    });
    const extensionId = new URL(worker.url()).host;
    await context.setOffline(true);
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.addInitScript(() => {
      const calls: string[] = [];
      const speech = new EventTarget() as EventTarget & SpeechSynthesis;
      Object.assign(speech, {
        cancel: () => undefined,
        getVoices: () => [],
        pause: () => undefined,
        resume: () => undefined,
        speak: (utterance: SpeechSynthesisUtterance) => calls.push(utterance.text)
      });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech });
      Object.defineProperty(window, '__sayItRightOfflineCalls', { configurable: true, value: calls });
    });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page.locator('#chunks')).toContainText('Kubernetes stays available offline.');
    await page.getByRole('button', { name: 'Read aloud' }).click();
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __sayItRightOfflineCalls: string[] }).__sayItRightOfflineCalls.length)).toBe(1);
    await page.getByRole('button', { name: 'Add cue', exact: true }).click();
    await page.getByLabel('Word or phrase').fill('Kubernetes');
    await page.getByLabel('Say it like').fill('koo-ber-net-ees');
    await page.getByRole('button', { name: 'Save cue' }).click();
    await expect.poll(() => worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues?.[0]?.sayAs)).toBe('koo-ber-net-ees');
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  } finally {
    await context.close();
  }
});

test('@claim:extension-entry-points packages toolbar, shortcut, and selection context-menu entry', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The package entry points only need one consumer check.');
  const manifest = JSON.parse(readFileSync('dist/extension/manifest.json', 'utf8')) as {
    action: { default_popup: string };
    background: { service_worker: string };
    commands: Record<string, { suggested_key: { default: string } }>;
  };
  expect(manifest.action.default_popup).toBe('popup.html');
  expect(manifest.commands._execute_action!.suggested_key.default).toBe('Alt+Shift+S');
  const background = readFileSync(join('dist/extension', manifest.background.service_worker), 'utf8');
  expect(background).toContain(CONTEXT_MENU_ID);
  expect(background).toContain('contextMenus.create');
  expect(background).toContain('%s');
  expect(CONTEXT_MENU_TITLE).toBe('Add pronunciation cue for “%s”');

  const stored: unknown[] = [];
  const badgeText: unknown[] = [];
  const badgeColors: unknown[] = [];
  let popupOpened = false;
  const handled = await handleSelectionContextMenu(
    { menuItemId: CONTEXT_MENU_ID, selectionText: 'PostgreSQL' },
    { id: 9, url: 'https://docs.example.org/guide' },
    {
      now: () => 1234,
      storePendingSelection: async (value) => { stored.push(value); },
      setBadgeText: async (value) => { badgeText.push(value); },
      setBadgeBackgroundColor: async (value) => { badgeColors.push(value); },
      openPopup: async () => { popupOpened = true; }
    }
  );
  expect(handled).toBe(true);
  expect(stored).toEqual([{ pendingSelection: { text: 'PostgreSQL', url: 'https://docs.example.org/guide', capturedAt: 1234, openCueForm: true } }]);
  expect(badgeText).toEqual([{ text: '1', tabId: 9 }]);
  expect(badgeColors).toEqual([{ color: '#D84A2F' }]);
  expect(popupOpened).toBe(true);
});

test('@claim:per-site-local-glossary keeps saved cues in extension storage and scoped to their sites', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium storage test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({
        cues: [{ id: 'one.example:NASA', term: 'NASA', sayAs: 'nass-uh', site: 'one.example', scope: 'site', createdAt: 1, updatedAt: 1 }],
        pendingSelection: { text: 'Nguyen joined.', url: 'https://two.example/people', capturedAt: Date.now() }
      });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page.locator('#cue-list')).not.toContainText('NASA');
    await page.getByRole('button', { name: 'Add cue', exact: true }).click();
    await page.getByLabel('Word or phrase').fill('Nguyen');
    await page.getByLabel('Say it like').fill('nwin');
    await page.getByRole('button', { name: 'Save cue' }).click();
    const cues = await worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues);
    expect(cues).toEqual(expect.arrayContaining([
      expect.objectContaining({ term: 'NASA', site: 'one.example' }),
      expect.objectContaining({ term: 'Nguyen', sayAs: 'nwin', site: 'two.example', scope: 'site' })
    ]));
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  } finally {
    await context.close();
  }
});

test('@claim:cue-lifecycle adds, previews, edits, and deletes a pronunciation cue', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The extension package only needs one Chromium cue lifecycle test.');
  const extensionPath = resolve('dist/extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await worker.evaluate(async () => {
      await chrome.storage.local.set({ pendingSelection: { text: 'Read PostgreSQL.', url: 'https://docs.example.org/guide', capturedAt: Date.now() } });
    });
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.addInitScript(() => {
      const calls: string[] = [];
      const speech = new EventTarget() as EventTarget & SpeechSynthesis;
      Object.assign(speech, {
        cancel: () => undefined,
        getVoices: () => [],
        pause: () => undefined,
        resume: () => undefined,
        speak: (utterance: SpeechSynthesisUtterance) => calls.push(utterance.text)
      });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech });
      Object.defineProperty(window, '__sayItRightPreviewCalls', { configurable: true, value: calls });
    });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Add cue', exact: true }).click();
    await page.getByLabel('Word or phrase').fill('PostgreSQL');
    await page.getByLabel('Say it like').fill('post-gress cue ell');
    await page.getByRole('button', { name: 'Preview pronunciation' }).click();
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __sayItRightPreviewCalls: string[] }).__sayItRightPreviewCalls)).toContain('post-gress cue ell');
    await page.getByRole('button', { name: 'Save cue' }).click();
    await expect(page.getByText('PostgreSQL', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Edit PostgreSQL' }).click();
    await page.getByLabel('Say it like').fill('post-gres-queue-ell');
    await page.getByRole('button', { name: 'Save cue' }).click();
    await expect.poll(() => worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues?.[0]?.sayAs)).toBe('post-gres-queue-ell');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete PostgreSQL' }).click();
    await expect(page.getByText('PostgreSQL', { exact: true })).toHaveCount(0);
    await expect.poll(() => worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues)).toEqual([]);
  } finally {
    await context.close();
  }
});
