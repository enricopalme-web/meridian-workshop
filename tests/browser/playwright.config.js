import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'echo "Assuming dev server already running on port 3000"',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
