#!/usr/bin/env node

import yargs from "yargs";

import { removeWorktreeDBeaverConnection } from "./dbeaver.ts";
import {
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
} from "./lib.ts";
import { resolveRepoRoot } from "./repo-root.ts";

const tag = WORKTREE_TEARDOWN_TAG;
const root = resolveRepoRoot(import.meta.url);

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
  .conflicts("dry-run", "apply")
  .check((args) => {
    if (!args.dryRun && !args.apply) {
      throw new Error("Set exactly one of --dry-run or --apply to true");
    }
    return true;
  })
  .strict()
  .parse();

assertGitWorktree(root, tag);

const slug = requireTeardownSlug(root, argv.slug as string | undefined, tag);
const pm2Prefix = resolveTeardownPm2Prefix(root, slug);

if (argv.dryRun) {
  logTeardownDryRun({
    tag,
    repoRoot: root,
    slug,
    pm2Prefix,
    dropDb: argv.dropDb,
    dbeaver: argv.dbeaver,
  });
} else {
  stopWorktreePm2Apps(root, pm2Prefix, tag);
  if (argv.dbeaver) {
    removeWorktreeDBeaverConnection({ tag, slug });
  }
  removeWorktreeFromWorkspace({
    mainRoot: requireMainWorktreeRoot(root, tag),
    slug,
    tag,
  });
  dropWorktreeDatabase(root, slug, argv.dropDb, tag);
  dropWorktreeTestDatabase(root, slug, argv.dropDb, tag);
  removeSlugFromRegistry(slug);
}
