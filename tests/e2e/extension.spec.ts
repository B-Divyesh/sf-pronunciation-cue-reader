import { test, expect, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';

test('@claim:site-cue-limit extension popup supports a keyboard-friendly cue flow', async ({}, testInfo) => {
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
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page.getByRole('heading', { level: 1, name: 'Read this selection' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '#main');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
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
    await page.locator('.tools summary').click();
    const backup: Array<{ term: string; sayAs: string; site: string; scope?: 'everywhere' }> = Array.from({ length: 21 }, (_, index) => ({ term: `Term ${index}`, sayAs: `term ${index}`, site: 'example.com' }));
    backup.push({ term: 'Everywhere', sayAs: 'everywhere', site: 'example.com', scope: 'everywhere' });
    await page.locator('#import-file').setInputFiles({ name: 'cue-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(page.locator('#toast')).toContainText('19 imported; 1 every-site cue uses an unsupported every-site scope; 2 cues exceed the 20-cue free limit.');
    const saved = await worker.evaluate(async () => (await chrome.storage.local.get('cues')).cues);
    expect(saved).toHaveLength(20);
    expect(saved.some((item: { scope: string }) => item.scope === 'everywhere')).toBe(false);
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('@claim:local-reader-data active reading exposes its current chunk and genuinely pauses and resumes', async ({}, testInfo) => {
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
