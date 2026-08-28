import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
