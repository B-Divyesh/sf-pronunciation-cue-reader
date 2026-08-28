import { test, expect, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';

test('extension popup supports a keyboard-friendly cue flow', async ({}, testInfo) => {
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
    await expect(page.locator('#toast')).toContainText('19 imported; 1 every-site cue requires Plus; 2 cues exceed the 20-cue free limit.');
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

test('active reading exposes its current chunk and genuinely pauses and resumes', async ({}, testInfo) => {
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
    page.on('pageerror', (error) => errors.push(error.message));
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
  } finally {
    await context.close();
  }
});
