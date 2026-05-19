#!/usr/bin/env node

import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { addWorktreeDBeaverConnection } from "./dbeaver.ts";
import {
  assertGitWorktree,
  cloneWorktreeDatabase,
  loadMainApiEnvForWorktree,
  logSetupDryRun,
  logSetupSummary,
  parseSetupArgs,
  previewWorktreePorts,
  registerWorktreePorts,
  requireMainWorktreeRoot,
  requireSourceDb,
  requireValidSlug,
  requireWorktreeRoot,
  WORKTREE_SETUP_TAG,
  writeWorktreeEnvFile,
} from "./lib.ts";

const tag = WORKTREE_SETUP_TAG;
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

assertGitWorktree(root, tag);
const worktreeRoot = requireWorktreeRoot(root, tag);
const slug = requireValidSlug(root, tag);

const {
  sourceDb: sourceDbArg,
  recreateDb,
  dbeaver,
  dryRun,
} = parseSetupArgs(process.argv);
const sourceDb = requireSourceDb(sourceDbArg, tag);

const mainRoot = requireMainWorktreeRoot(root, tag);
const { secrets, databaseUrl, destDb } = loadMainApiEnvForWorktree(
  mainRoot,
  slug,
  tag,
);

if (dryRun) {
  logSetupDryRun({
    tag,
    worktreeRoot,
    mainRoot,
    slug,
    sourceDb,
    destDb,
    databaseUrl,
    recreateDb,
    dbeaver,
    ports: previewWorktreePorts(slug),
  });
} else {
  cloneWorktreeDatabase({
    tag,
    slug,
    sourceDb,
    destDb,
    worktreeRoot,
    recreateDb,
  });

  const allocatedPorts = registerWorktreePorts(slug);
  const envPath = writeWorktreeEnvFile({
    worktreeRoot,
    slug,
    ports: allocatedPorts,
    secrets,
    databaseUrl,
  });

  if (dbeaver) {
    addWorktreeDBeaverConnection({ tag, slug, databaseUrl });
  }

  logSetupSummary({ tag, envPath, ports: allocatedPorts, databaseUrl, destDb });
}
