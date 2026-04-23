#!/usr/bin/env node

import { mkdtemp, readdir, rm, mkdir, copyFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const cwd = process.cwd();
const migrationsDir = resolve(cwd, "src/database/migrations");
const args = new Set(process.argv.slice(2));
const confirmed = args.has("--yes");

function run(command, commandArgs, label) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(
        new Error(
          `[migrate:squash] ${label} failed (exit ${code ?? "unknown"}).`,
        ),
      );
    });
  });
}

async function removeDirContents(directory) {
  await mkdir(directory, { recursive: true });
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map((entry) =>
      rm(join(directory, entry.name), { recursive: true, force: true }),
    ),
  );
}

async function copyDirContents(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const src = join(source, entry.name);
    const dst = join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirContents(src, dst);
    } else if (entry.isFile()) {
      await copyFile(src, dst);
    }
  }
}

async function main() {
  if (!confirmed) {
    console.error("[migrate:squash] This command rewrites migration history.");
    console.error("[migrate:squash] Re-run with --yes to confirm.");
    process.exit(1);
  }

  const tempOutDir = await mkdtemp(
    join(tmpdir(), "job-tracker-migration-squash-"),
  );

  try {
    console.log(`[migrate:squash] Generating baseline in ${tempOutDir}...`);
    await run(
      "pnpm",
      [
        "exec",
        "drizzle-kit",
        "generate",
        "--schema",
        "./src/database/schema/index.ts",
        "--dialect",
        "postgresql",
        "--out",
        tempOutDir,
        "--name",
        "baseline",
        "--prefix",
        "index",
      ],
      "drizzle-kit generate",
    );

    console.log(
      "[migrate:squash] Replacing current migrations with baseline...",
    );
    await removeDirContents(migrationsDir);
    await copyDirContents(tempOutDir, migrationsDir);

    console.log(
      "[migrate:squash] Done. Review git diff before applying in shared environments.",
    );
  } finally {
    await rm(tempOutDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
