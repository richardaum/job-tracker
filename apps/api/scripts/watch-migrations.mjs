#!/usr/bin/env node

import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { resolve } from "node:path";

const migrationsDir = resolve(process.cwd(), "src/database/migrations");

let running = false;
let pending = false;
let debounceTimer = null;

function runMigrate() {
  if (running) {
    pending = true;
    return;
  }

  running = true;
  console.log("[migrate:watch] Running migrations...");

  const child = spawn("pnpm", ["run", "db:migrate"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    running = false;
    if (code === 0) {
      console.log("[migrate:watch] Migrations finished.");
    } else {
      console.error(
        `[migrate:watch] Migration failed (exit ${code ?? "unknown"}).`,
      );
    }

    if (pending) {
      pending = false;
      runMigrate();
    }
  });
}

function scheduleMigrate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    runMigrate();
  }, 300);
}

console.log(`[migrate:watch] Watching ${migrationsDir}`);
console.log(
  "[migrate:watch] Migrations run before Nest via api#dev; this watcher re-runs migrate when TypeORM migration sources change.",
);

const watcher = watch(
  migrationsDir,
  { recursive: true },
  (_eventType, filename) => {
    if (!filename) return;
    console.log(`[migrate:watch] Change detected: ${filename}`);
    scheduleMigrate();
  },
);

process.on("SIGINT", () => {
  watcher.close();
  process.exit(0);
});
