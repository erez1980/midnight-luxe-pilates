import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:3000', viewport: { width: 1280, height: 900 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
    trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI,
    env: { VITE_SUPABASE_URL: 'https://pilates-test.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-anon-key' } },
});
