import { defineConfig, devices } from "@playwright/test";

// PW_CHROMIUM_PATH lets the tests use an already installed Chromium (e.g. in CI images).
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    locale: "ar-LY",
    trace: "off",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 }, launchOptions: { executablePath } } },
    { name: "mobile-360", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, launchOptions: { executablePath } } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
