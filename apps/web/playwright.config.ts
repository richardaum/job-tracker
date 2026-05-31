import "./src/env/load-dotenv";

import { defineConfig, devices } from "@playwright/test";

import { e2eEnv } from "./src/env/e2e";
import { isCI } from "./src/env/is-ci";

const ci = isCI();
const PORT = String(e2eEnv.E2E_PORT);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 1 : undefined,
  reporter: "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: `PORT=${PORT} pnpm start`, url: baseURL, reuseExistingServer: !ci, timeout: 120 * 1000 },
});
