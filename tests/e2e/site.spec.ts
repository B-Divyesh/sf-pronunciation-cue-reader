import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

for (const colorScheme of ['light', 'dark'] as const) {
  test(`landing page is usable and has no serious accessibility violations in ${colorScheme} mode`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await expect(page).toHaveTitle(/Say It Right/);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('#how-title')).toBeVisible();
    await expect(page.locator('.steps h3')).toHaveCount(3);
    await expect(page.locator('.line-icon').first()).toHaveText('Aa');
    await expect(page.getByRole('link', { name: 'Try it with sample data' })).toHaveAttribute('href', '/demo/');
    await expect(page.getByRole('link', { name: 'Download for Chrome' })).toHaveAttribute('href', '/downloads/say-it-right.zip');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '#main');
    expect(consoleErrors).toEqual([]);
  });
}

test('@claim:reader-accessibility site keeps content visible at 200% text size and reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'The text-resize regression is exercised at the requested mobile viewport.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test('@claim:demo-sandbox the one-click sample reader is isolated, resettable, and discarded before real use', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page).toHaveTitle('Demo — Say It Right');
  await expect(page.getByRole('heading', { level: 1, name: 'Try pronunciation cues with sample text.' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved to your real reader.')).toBeVisible();
  await expect(page.locator('#demo-passage')).toContainText('Kubernetes');
  await expect(page.locator('.demo-chunk.has-cue')).toHaveCount(2);
  await expect(page.locator('#demo-cue-list li')).toHaveCount(3);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:pronunciation-cue-reader:cues']);

  await page.getByLabel('Word or phrase').fill('OpenTelemetry');
  await page.getByLabel('Say it like').fill('open tel eh metry');
  await page.getByRole('button', { name: 'Save sample cue' }).click();
  await expect(page.locator('#demo-cue-list')).toContainText('OpenTelemetry');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-cue-list')).not.toContainText('OpenTelemetry');
  const lightResults = await new AxeBuilder({ page }).analyze();
  expect(lightResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/#install$/);
  expect(await page.evaluate(() => localStorage.getItem('demo:pronunciation-cue-reader:cues'))).toBeNull();
});

test('@claim:no-account-demo opens the working sample reader without an account', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.locator('#demo-passage')).toContainText('Kubernetes');
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
});

test('@claim:source-preserving demo keeps displayed selected text separate from its spoken cue output', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.locator('#demo-passage')).toHaveText('The Kubernetes team stores release notes in PostgreSQL. NASA keeps a glossary for new contributors.');
  await expect(page.locator('.demo-chunk').first()).toHaveAttribute('data-spoken', /koo-ber-net-ees/);
  await expect(page.locator('.demo-chunk').first()).toContainText('Kubernetes');
});

test('@claim:site-no-trackers landing requests stay same-origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('legal pages are present and linked', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeVisible();
});

test('every public route has canonical, social-card, and Apple-touch metadata', async ({ page }) => {
  const routes = [
    { path: '/', canonical: 'https://pronunciation-cue-reader.sociobot.in/' },
    { path: '/demo/', canonical: 'https://pronunciation-cue-reader.sociobot.in/demo/' },
    { path: '/privacy/', canonical: 'https://pronunciation-cue-reader.sociobot.in/privacy/' },
    { path: '/terms/', canonical: 'https://pronunciation-cue-reader.sociobot.in/terms/' },
    { path: '/404.html', canonical: 'https://pronunciation-cue-reader.sociobot.in/404.html' }
  ];

  for (const [index, route] of routes.entries()) {
    await page.goto(route.path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', route.canonical);
    await expect(page.locator('meta[property="og:title"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/pronunciation-cue-reader\.sociobot\.in\/assets\/say-it-right-social-[a-f0-9]{12}\.jpg$/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:title"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('meta[name="twitter:description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^https:\/\/pronunciation-cue-reader\.sociobot\.in\/assets\/say-it-right-social-[a-f0-9]{12}\.jpg$/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');

    if (index === 0) {
      const imagePath = new URL((await page.locator('meta[property="og:image"]').getAttribute('content'))!).pathname;
      expect(await page.evaluate((source) => new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('Social image did not load.'));
        image.src = source;
      }), imagePath)).toEqual({ width: 1200, height: 630 });
      expect(await page.evaluate(() => new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('Apple touch icon did not load.'));
        image.src = '/apple-touch-icon.png';
      }))).toEqual({ width: 180, height: 180 });
    }
  }
});

test('ships a styled 404 document with a static-host response override', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1, name: 'That page is not here.' })).toBeVisible();
  const config = JSON.parse(readFileSync('dist/site/staticwebapp.config.json', 'utf8')) as {
    navigationFallback?: unknown;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
});

test('does not advertise an unprovisioned Plus checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="https://api.sociobot.in/api/v1/products/pronunciation-cue-reader/checkout"]')).toHaveCount(0);
  await expect(page.getByText(/Plus/, { exact: false })).toHaveCount(0);
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
  expect(config.globalHeaders['Content-Security-Policy']).toContain("connect-src 'self'");
  expect(config.globalHeaders['Content-Security-Policy']).not.toContain('api.sociobot.in');
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
  for (const locator of [
    page.locator('.site-footer .logo'),
    page.getByRole('link', { name: 'Privacy' }).last(),
    page.getByRole('link', { name: 'Terms' }).last(),
    page.getByRole('link', { name: 'Source' }),
  ]) {
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
  expect(await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return Boolean(registration.waiting);
  })).toBe(false);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
