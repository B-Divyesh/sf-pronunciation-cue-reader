import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

test('landing page is usable and has no serious accessibility violations', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Say It Right/);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Download for Chrome' })).toHaveAttribute('href', '/downloads/say-it-right.zip');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('legal pages are present and linked', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeVisible();
});

test('checkout return stores and strips a license', async ({ page }) => {
  await page.goto('/?license=example-test-token');
  await expect(page).toHaveURL('/');
  await expect(page.locator('#site-license')).toHaveValue('example-test-token');
  await expect(page.locator('#license-status')).toContainText('Purchase received');
});

test('ships a real extension archive plus deploy policy and offline shell', async ({ request }) => {
  const download = await request.get('/downloads/say-it-right.zip');
  expect(download.ok()).toBe(true);
  expect(new TextDecoder().decode((await download.body()).slice(0, 2))).toBe('PK');

  const config = JSON.parse(readFileSync('dist/site/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
    routes: Array<{ route: string; headers: Record<string, string> }>;
    mimeTypes: Record<string, string>;
  };
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.mimeTypes['.zip']).toBe('application/zip');

  const worker = readFileSync('dist/site/sw.js', 'utf8');
  expect(worker).not.toContain('__PRECACHE__');
  expect(worker).not.toContain('__CACHE_NAME__');
  expect(worker).toMatch(/\/assets\/site-[\w-]+\.js/);
  expect(worker).toMatch(/\/assets\/site-[\w-]+\.css/);
});

test('keeps visible mobile navigation and footer targets at least 44px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Target-size regression is exercised at the requested mobile viewport.');
  await page.goto('/');
  for (const locator of [page.locator('.site-header .logo'), page.locator('.site-header .nav-download')]) {
    await expect(locator).toBeVisible();
    expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
  await page.locator('footer').scrollIntoViewIfNeeded();
  for (const locator of [page.locator('.site-footer .logo'), page.getByRole('link', { name: 'Privacy' }).last(), page.getByRole('link', { name: 'Terms' }).last(), page.getByRole('link', { name: 'Source' })]) {
    await expect(locator).toBeVisible();
    expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});

test('fresh service worker install reloads the app while offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One fresh Chromium profile is enough to verify the precache.');
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
