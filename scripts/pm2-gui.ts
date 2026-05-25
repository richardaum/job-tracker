#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ecosystemConfig,
  ecosystemConfigPath,
  ecosystemPm2Args,
} from "./pm2-ecosystem.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const guiApp = ecosystemConfig.apps.find((app) =>
  app.name.endsWith("ezpm2gui"),
);

if (!guiApp) {
  console.error("[pm2:gui] ezpm2gui app not found in ecosystem.config.ts");
  process.exit(1);
}

const port = guiApp.env?.PORT ?? "9310";
const host = guiApp.env?.HOST ?? "127.0.0.1";

console.warn(`[pm2:gui] Starting ${guiApp.name} at http://${host}:${port}`);

const result = spawnSync(
  "pm2",
  ["start", ecosystemConfigPath, ...ecosystemPm2Args, "--only", guiApp.name],
  { cwd: root, stdio: "inherit" },
);

if (result.status !== 0) process.exit(1);
