import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'node:path'

// Resuelve .env relativo a este archivo (no a process.cwd()), para que
// funcione sin importar desde qué directorio se invoque el test runner.
dotenv.config({ path: path.resolve(__dirname, '.env') })

const API_SPEC_PATTERN = /.*\.api\.spec\.ts/

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ui-chromium',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.BASE_URL },
      testIgnore: API_SPEC_PATTERN,
    },
    {
      name: 'ui-firefox',
      use: { ...devices['Desktop Firefox'], baseURL: process.env.BASE_URL },
      testIgnore: API_SPEC_PATTERN,
    },
    {
      name: 'ui-webkit',
      use: { ...devices['Desktop Safari'], baseURL: process.env.BASE_URL },
      testIgnore: API_SPEC_PATTERN,
    },
    {
      name: 'ui-mobile-chrome',
      use: { ...devices['Pixel 5'], baseURL: process.env.BASE_URL },
      testIgnore: API_SPEC_PATTERN,
    },
    {
      name: 'ui-mobile-safari',
      use: { ...devices['iPhone 13'], baseURL: process.env.BASE_URL },
      testIgnore: API_SPEC_PATTERN,
    },
    {
      name: 'api',
      testMatch: API_SPEC_PATTERN,
      use: { baseURL: process.env.API_URL },
    },
  ],
})
