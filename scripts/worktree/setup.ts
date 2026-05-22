#!/usr/bin/env node

import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { addWorktreeDBeaverConnection } from "./dbeaver.ts";
import {
  assertGitWorktree,
  buildDestinationTestDatabaseUrl,
  cloneWorktreeDatabase,
  cloneWorktreeTestDatabase,
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
  runWorktreePostSetup,
  testDbNameForSlug,
  WORKTREE_SETUP_TAG,
  writeWorktreeEnvFile,
} from "./lib.ts";

const tag = WORKTREE_SETUP_TAG;
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

assertGitWorktree(root, tag);
const worktreeRoot = requireWorktreeRoot(root, tag);
const slug = requireValidSlug(root, tag);

const args = parseSetupArgs(process.argv);
const sourceDb = requireSourceDb(args.sourceDb, tag);

const mainRoot = requireMainWorktreeRoot(root, tag);
const { secrets, databaseUrl, destDb } = loadMainApiEnvForWorktree(
  mainRoot,
  slug,
  tag,
);

if (args.dryRun) {
  logSetupDryRun({
    tag,
    worktreeRoot,
    mainRoot,
    slug,
    sourceDb,
    destDb,
    databaseUrl,
    e2eDatabaseUrl: buildDestinationTestDatabaseUrl(databaseUrl, slug),
    recreateDb: args.recreateDb,
    dbeaver: args.dbeaver,
    forceDbeaver: args.forceDbeaver,
    ports: previewWorktreePorts(slug),
    install: args.install,
    migrate: args.migrate,
    start: args.start,
    verify: args.verify,
  });
} else {
  cloneWorktreeDatabase({
    tag,
    slug,
    sourceDb,
    destDb,
    worktreeRoot,
    recreateDb: args.recreateDb,
  });

  const testDatabaseUrl = buildDestinationTestDatabaseUrl(databaseUrl, slug);
  cloneWorktreeTestDatabase({
    tag,
    slug,
    testDbName: testDbNameForSlug(slug),
    worktreeRoot,
    recreateDb: args.recreateDb,
  });

  const allocatedPorts = registerWorktreePorts(slug);
  const envPath = writeWorktreeEnvFile({
    worktreeRoot,
    slug,
    ports: allocatedPorts,
    secrets,
    databaseUrl,
    e2eDatabaseUrl: testDatabaseUrl,
  });

  if (args.dbeaver) {
    addWorktreeDBeaverConnection({
      tag,
      slug,
      databaseUrl,
      force: args.forceDbeaver,
    });
  }

  logSetupSummary({
    tag,
    envPath,
    ports: allocatedPorts,
    databaseUrl,
    e2eDatabaseUrl: testDatabaseUrl,
    destDb,
  });

  runWorktreePostSetup({
    tag,
    repoRoot: root,
    install: args.install,
    migrate: args.migrate,
    start: args.start,
    verify: args.verify,
  });
}
