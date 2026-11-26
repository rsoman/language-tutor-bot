import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

// playwright-bdd turns e2e/features/*.feature into Playwright tests (in .features-gen/),
// using the step definitions in e2e/steps/. Same idea as pytest-bdd on the backend.
const bddTestDir = defineBddConfig({
  features: 'e2e/features/*.feature',
  steps: 'e2e/steps/*.ts',
})

const port = 4173

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'off',
  },
  projects: [
    // The spec's acceptance criteria, generated from the .feature files.
    { name: 'bdd', testDir: bddTestDir, use: { ...devices['Desktop Chrome'] } },
    // Plain Playwright tests for non-behavioural criteria such as accessibility.
    { name: 'a11y', testDir: 'e2e/a11y', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // --host 127.0.0.1: Vite may otherwise listen only on IPv6 (::1) on CI runners,
    // and the readiness check below would never connect.
    command: `pnpm exec vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
  },
})
