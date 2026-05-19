#!/usr/bin/env node

import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { removeWorktreeDBeaverConnection } from "./dbeaver.ts";
import {
  dropWorktreeDatabase,
  logTeardownDryRun,
  logWorktreeRemoveHint,
  parseTeardownArgs,
  removeSlugFromRegistry,
  removeWorktreeEnvFile,
  requireTeardownSlug,
  resolveTeardownPm2Prefix,
  stopWorktreePm2Apps,
  WORKTREE_TEARDOWN_TAG,
} from "./lib.ts";

const tag = WORKTREE_TEARDOWN_TAG;
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

const {
  slug: slugArg,
  dropDb,
  dbeaver,
  dryRun,
} = parseTeardownArgs(process.argv);
const slug = requireTeardownSlug(root, slugArg, tag);
const pm2Prefix = resolveTeardownPm2Prefix(root, slug);

if (dryRun) {
  logTeardownDryRun({ tag, repoRoot: root, slug, pm2Prefix, dropDb, dbeaver });
} else {
  stopWorktreePm2Apps(root, pm2Prefix, tag);
  removeSlugFromRegistry(slug);
  removeWorktreeEnvFile(root, tag);
  if (dbeaver) {
    removeWorktreeDBeaverConnection({ tag, slug });
  }
  dropWorktreeDatabase(root, slug, dropDb, tag);
  logWorktreeRemoveHint(root, tag);
}
