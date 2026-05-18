#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  dbNameForSlug,
  loadEnvWorktree,
  removeSlugFromRegistry,
  runGit,
} from "./worktree-lib.ts";

const tag = "[worktree:teardown]";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

function fail(message: string): never {
  console.error(`${tag} ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): { slug?: string; dropDb: boolean } {
  let slug: string | undefined;
  let dropDb = false;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--drop-db") {
      dropDb = true;
      continue;
    }
    if (!arg.startsWith("-")) slug = arg;
  }
  return { slug, dropDb };
}

function pm2Delete(names: string[]): void {
  if (names.length === 0) return;
  spawnSync("pm2", ["delete", ...names], { cwd: root, stdio: "inherit" });
}

function main(): void {
  const { slug: slugArg, dropDb } = parseArgs(process.argv);
  const env = loadEnvWorktree(root);
  const slug = slugArg ?? env.PM2_APP_PREFIX ?? env.WORKTREE_SLUG;
  if (!slug) {
    fail(
      "Could not determine slug. Pass as argument or run from a worktree with .env.worktree.",
    );
  }

  const prefix = env.PM2_APP_PREFIX ?? slug;
  const appNames = [
    `${prefix}-api`,
    `${prefix}-web`,
    `${prefix}-storybook`,
    `${prefix}-extension`,
  ];

  console.warn(`${tag} pm2 delete ${appNames.join(" ")}`);
  pm2Delete(appNames);

  removeSlugFromRegistry(slug);

  const envPath = join(root, ".env.worktree");
  if (existsSync(envPath)) {
    unlinkSync(envPath);
    console.warn(`${tag} removed ${envPath}`);
  }

  if (dropDb) {
    const dbName = dbNameForSlug(slug);
    console.warn(`${tag} dropdb ${dbName}`);
    const result = spawnSync("dropdb", [dbName], { stdio: "inherit" });
    if (result.status !== 0) {
      fail(`dropdb ${dbName} failed.`);
    }
  } else {
    const dbName = dbNameForSlug(slug);
    console.warn(
      `${tag} database ${dbName} preserved. Pass --drop-db to remove it.`,
    );
  }

  const wtRoot = runGit(["rev-parse", "--show-toplevel"], root);
  if (wtRoot.ok) {
    console.warn(
      `${tag} git worktree remove is manual: git worktree remove ${wtRoot.stdout}`,
    );
  }
}

main();
