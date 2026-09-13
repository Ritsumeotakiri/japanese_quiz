import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  webServer: { command: 'pnpm dev --host 0.0.0.0', url: 'http://localhost:5173', reuseExistingServer: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
