import { defineConfig, devices } from '@playwright/test'

// Isolated config for capturing customer-menu zone screenshots.
// No globalSetup (DB is seeded manually with the .env password); mobile iPhone-ish viewport.
export default defineConfig({
  testDir: './tests',
  testMatch: 'capture-menu-zones.spec.ts',
  timeout: 120_000,
  retries: 0,
  reporter: [['line']],
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    actionTimeout: 15_000,
    navigationTimeout: 25_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } },
  ],
})
