#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ecosystemConfig } from "./pm2-ecosystem.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const devApps = ecosystemConfig.apps
  .map((app) => app.name)
  .filter((name) => !name.endsWith("ezpm2gui"));

if (devApps.length === 0) {
  console.error("[pm2:restart] No dev apps found in ecosystem.config.ts");
  process.exit(1);
}

console.warn(
  `[pm2:restart] Restarting dev apps (skipping ezpm2gui): ${devApps.join(", ")}`,
);

const result = spawnSync("pm2", ["restart", ...devApps, "--update-env"], {
  cwd: root,
  stdio: "inherit",
});

if (result.status !== 0) process.exit(1);
