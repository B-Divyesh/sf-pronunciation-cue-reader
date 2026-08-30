import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  // Extension profiles and the service-worker offline check are Chromium-heavy.
  // Keep them serial so a constrained CI worker does not crash a shared browser.
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    launchOptions: { channel: 'chromium' }
  },
  webServer: {
    command: 'npm run build && npx vite preview --config site.vite.config.ts --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, userAgent: devices['iPhone 13'].userAgent } }
  ]
});
