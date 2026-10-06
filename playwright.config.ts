import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { defineBddConfig } from 'playwright-bdd';

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['features/steps/**/*.ts', 'fixtures/pages.fixture.ts'],
});

// Load environment variables from .env file
// This keeps secrets (passwords, API keys, DB connection strings) OUT of Git
dotenv.config({ path: path.resolve(__dirname, '.env'),
  quiet: true,   // ← suppresses the tip banner
 });

export default defineConfig({
  testDir: './tests',

  // ── TIMEOUTS ─────────────────────────────────────────────
  // Max time ONE test can run before being killed (default 30s)
  timeout: 60 * 1000,

  expect: {
    // Max time an expect() assertion will retry before failing (default 5s)
    // Playwright polls the condition repeatedly until it passes or times out
    timeout: 10 * 1000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  // ── MULTIPLE REPORTERS ───────────────────────────────────
  // You can run several reporters simultaneously — each serves a purpose
  reporter: [
    ['html', { open: 'never' }],                          // human-readable, for debugging
    ['list'],                                             // live console output while running
    ['json', { outputFile: 'test-results/results.json' }],// machine-readable, for KPI dashboards
    ['junit', { outputFile: 'test-results/junit.xml' }],  // ← Jenkins & Azure DevOps read this
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    // ── DEBUGGING ARTIFACTS ────────────────────────────────
    trace: 'retain-on-failure',        // keep trace only for failed tests
    screenshot: 'only-on-failure',     // auto-screenshot on failure
    video: 'retain-on-failure',        // video recording of failures

    // ── TIMING ─────────────────────────────────────────────
    actionTimeout: 15 * 1000,          // max time for click(), fill(), etc.
    navigationTimeout: 30 * 1000,      // max time for goto(), waitForURL()

    // ── VIEWPORT & BEHAVIOR ────────────────────────────────
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,           // useful for QA envs with self-signed certs

    // ── API TESTING SUPPORT ────────────────────────────────
    // Default headers sent with every request via the `request` fixture
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  projects: [
  // ── SETUP: runs first, produces the auth file ──────────
  {
    name: 'setup',
    testMatch: /auth\.setup\.ts/,
  },

  // ── UNAUTHENTICATED: clean browser, no session ─────────
  {
    name: 'auth-chromium',
    testDir: './tests/auth',
    use: {
      ...devices['Desktop Chrome'],
      storageState: undefined,
    },
  },

  // ── AUTHENTICATED: session pre-loaded ──────────────────
  {
    name: 'chromium',
    testDir: './tests/ui',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
  {
    name: 'firefox',
    testDir: './tests/ui',
    use: {
      ...devices['Desktop Firefox'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
  {
    name: 'webkit',
    testDir: './tests/ui',
    use: {
      ...devices['Desktop Safari'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
  
  {
  name: 'bdd',
  testDir: bddTestDir,
  use: {
    ...devices['Desktop Chrome'],
    storageState: undefined,
  },
},
  // ── API: no browser needed ─────────────────────────────
  {
  name: 'api',
  testDir: './tests/api',
  use: {
    baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  },
},
],
  // Where screenshots/videos/traces get written
  outputDir: 'test-results/',
});