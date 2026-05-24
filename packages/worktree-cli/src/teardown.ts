#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findRepoRoot(from: string): string {
  let dir = dirname(fileURLToPath(from));
  while (true) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error("pnpm-workspace.yaml not found");
    dir = parent;
  }
}

const repoRoot = findRepoRoot(import.meta.url);

if (!existsSync(join(repoRoot, "node_modules"))) {
  console.log(
    "[worktree:teardown] node_modules missing, running pnpm install...",
  );
  const result = spawnSync("pnpm", ["install"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const { default: yargs } = await import("yargs");
const { removeWorktreeDBeaverConnection } = await import("./dbeaver.ts");
const {
  assertGitWorktree,
  dropWorktreeDatabase,
  dropWorktreeTestDatabase,
  logTeardownDryRun,
  removeSlugFromRegistry,
  removeWorktreeFromWorkspace,
  requireMainWorktreeRoot,
  requireTeardownSlug,
  resolveTeardownPm2Prefix,
  stopWorktreePm2Apps,
  WORKTREE_TEARDOWN_TAG,
} = await import("./lib.ts");

const tag = WORKTREE_TEARDOWN_TAG;

const raw = process.argv.slice(2);
const scriptIdx = raw.findIndex((a) => !a.startsWith("-") || a === "--");
const userArgs = scriptIdx >= 0 ? raw.slice(scriptIdx + 1) : raw;

const argv = await yargs(userArgs)
  .option("dry-run", {
    type: "boolean",
    default: false,
    description: "Dry run (print plan only, no writes)",
  })
  .option("apply", {
    type: "boolean",
    default: false,
    description: "Execute teardown",
  })
  .option("drop-db", {
    type: "boolean",
    default: true,
    description: "Drop the worktree database",
  })
  .option("dbeaver", {
    type: "boolean",
    default: false,
    description: "Remove DBeaver connection",
  })
  .positional("slug", {
    type: "string",
    description: "Worktree slug (optional, derived from directory name)",
  })
  .check((args) => {
    if (args.dryRun && args.apply) {
      throw new Error("Arguments dry-run and apply are mutually exclusive");
    }
    if (!args.dryRun && !args.apply) {
      throw new Error("Set exactly one of --dry-run or --apply to true");
    }
    return true;
  })
  .strict()
  .parse();

assertGitWorktree(repoRoot, tag);

const slug = requireTeardownSlug(
  repoRoot,
  argv.slug as string | undefined,
  tag,
);
const pm2Prefix = resolveTeardownPm2Prefix(repoRoot, slug);

if (argv.dryRun) {
  logTeardownDryRun({
    tag,
    repoRoot,
    slug,
    pm2Prefix,
    dropDb: argv.dropDb,
    dbeaver: argv.dbeaver,
  });
} else {
  stopWorktreePm2Apps(repoRoot, pm2Prefix, tag);
  if (argv.dbeaver) {
    removeWorktreeDBeaverConnection({ tag, slug });
  }
  removeWorktreeFromWorkspace({
    mainRoot: requireMainWorktreeRoot(repoRoot, tag),
    slug,
    tag,
  });
  dropWorktreeDatabase(repoRoot, slug, argv.dropDb, tag);
  dropWorktreeTestDatabase(repoRoot, slug, argv.dropDb, tag);
  removeSlugFromRegistry(slug);
}
