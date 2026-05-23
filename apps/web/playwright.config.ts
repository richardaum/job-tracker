import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { clientEnv } from "./src/env/client";
import { isCI } from "./src/env/server";

function loadWorktreeWebPort(): string | undefined {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return undefined;
  const content = readFileSync(envPath, "utf8");
  const match = content.match(/^E2E_PORT=(\d+)$/m);
  return match?.[1];
}

const ci = isCI();

// Worktree: reuse PM2 web server (E2E_PORT = WEB_PORT).
// Main checkout: E2E_PORT from clientEnv (default 3102).
const PORT = loadWorktreeWebPort() ?? String(clientEnv.E2E_PORT);
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
  webServer: {
    command: `PORT=${PORT} pnpm dev`,
    url: baseURL,
    reuseExistingServer: !ci,
    timeout: 120 * 1000,
  },
});
