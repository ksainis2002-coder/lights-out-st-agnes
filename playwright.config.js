import { defineConfig, devices } from '@playwright/test';

// All tests run against the Vite preview server of a fresh build, never file://.
const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  // 60 s a test: the slowest load several levels with a software renderer, about 25 s on a
  // laptop and past 30 s on a slower GitHub runner when every test runs at once.
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
