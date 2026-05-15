import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  timeout: 45_000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['line']],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
