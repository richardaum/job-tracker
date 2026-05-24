#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ecosystem = require(path.join(root, "ecosystem.config.cjs")) as {
  apps: Array<{ name: string; env?: { PORT?: string; HOST?: string } }>;
};

const guiApp = ecosystem.apps.find((app) => app.name.endsWith("ezpm2gui"));

if (!guiApp) {
  console.error("[pm2:gui] ezpm2gui app not found in ecosystem.config.cjs");
  process.exit(1);
}

const port = guiApp.env?.PORT ?? "9310";
const host = guiApp.env?.HOST ?? "127.0.0.1";

console.warn(`[pm2:gui] Starting ${guiApp.name} at http://${host}:${port}`);

const result = spawnSync(
  "pm2",
  ["start", path.join(root, "ecosystem.config.cjs"), "--only", guiApp.name],
  { cwd: root, stdio: "inherit" },
);

if (result.status !== 0) process.exit(1);
