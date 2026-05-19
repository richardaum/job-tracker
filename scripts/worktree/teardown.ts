#!/usr/bin/env node

import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { removeWorktreeDBeaverConnection } from "./dbeaver.ts";
import {
  assertGitWorktree,
  dropWorktreeDatabase,
  logTeardownDryRun,
  logWorktreeRemoveHint,
  parseTeardownArgs,
  removeSlugFromRegistry,
  removeWorktreeEnvFile,
  requireTeardownSlug,
  resolveTeardownMode,
  resolveTeardownPm2Prefix,
  stopWorktreePm2Apps,
  WORKTREE_TEARDOWN_TAG,
} from "./lib.ts";

const tag = WORKTREE_TEARDOWN_TAG;
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

assertGitWorktree(root, tag);

const args = parseTeardownArgs(process.argv);
const mode = resolveTeardownMode(args, tag);
const slug = requireTeardownSlug(root, args.slug, tag);
const pm2Prefix = resolveTeardownPm2Prefix(root, slug);

if (mode === "dry-run") {
  logTeardownDryRun({
    tag,
    repoRoot: root,
    slug,
    pm2Prefix,
    dropDb: args.dropDb,
    dbeaver: args.dbeaver,
  });
} else {
  stopWorktreePm2Apps(root, pm2Prefix, tag);
  if (args.dbeaver) {
    removeWorktreeDBeaverConnection({ tag, slug });
  }
  dropWorktreeDatabase(root, slug, args.dropDb, tag);
  removeSlugFromRegistry(slug);
  removeWorktreeEnvFile(root, tag);
  logWorktreeRemoveHint(root, tag);
}
