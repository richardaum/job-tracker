#!/usr/bin/env node

import { join } from "node:path";

import yargs from "yargs";

import { addWorktreeDBeaverConnection } from "./dbeaver.ts";
import { worktreeEnv } from "./env.ts";
import {
  addWorktreeToWorkspace,
  assertGitWorktree,
  buildDestinationTestDatabaseUrl,
  cloneWorktreeDatabase,
  cloneWorktreeTestDatabase,
  loadMainApiEnvForWorktree,
  logSetupDryRun,
  logSetupSummary,
  previewWorktreePorts,
  registerWorktreePorts,
  requireMainWorktreeRoot,
  requireValidSlug,
  requireWorktreeRoot,
  runWorktreePostSetup,
  testDbNameForSlug,
  WORKTREE_SETUP_TAG,
  worktreeFail,
  writeWorktreeAppEnvs,
} from "./lib.ts";
import { resolveRepoRoot } from "./repo-root.ts";

const tag = WORKTREE_SETUP_TAG;
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
  .option("recreate-db", {
    type: "boolean",
    default: false,
    description: "Drop and re-clone destination DB",
  })
  .option("dbeaver", {
    type: "boolean",
    default: false,
    description: "Add DBeaver connection under Job Tracker/Worktrees",
  })
  .option("force-dbeaver", {
    type: "boolean",
    default: false,
    description: "Replace existing DBeaver connection (requires --dbeaver)",
  })
  .option("install", {
    type: "boolean",
    default: false,
    description: "Run pnpm install after core setup",
  })
  .option("migrate", {
    type: "boolean",
    default: false,
    description: "Run pnpm --filter @job-tracker/api run db:migrate",
  })
  .option("start", {
    type: "boolean",
    default: false,
    description: "Run pnpm pm2:start",
  })
  .option("verify", {
    type: "boolean",
    default: false,
    description: "Verify API/Web/Storybook/WXT health endpoints",
  })
  .option("source-db", {
    type: "string",
    description:
      "Database to clone (default: WORKTREE_SOURCE_DB from worktreeEnv)",
  })
  .strict()
  .check((args) => {
    if (args.forceDbeaver && !args.dbeaver) {
      throw new Error("--force-dbeaver requires --dbeaver");
    }
    return true;
  })
  .parse();

assertGitWorktree(root, tag);
const worktreeRoot = requireWorktreeRoot(root, tag);
const slug = requireValidSlug(root, tag);

const sourceDb = argv.sourceDb ?? worktreeEnv.WORKTREE_SOURCE_DB;
if (!sourceDb) {
  worktreeFail(
    tag,
    "WORKTREE_SOURCE_DB is required.\n" +
      "  export WORKTREE_SOURCE_DB=job_tracker\n" +
      "  pnpm worktree:setup\n" +
      "Or: pnpm worktree:setup -- --source-db job_tracker",
  );
}

const mainRoot = requireMainWorktreeRoot(root, tag);
const { databaseUrl, destDb } = loadMainApiEnvForWorktree(mainRoot, slug, tag);

if (argv.dryRun) {
  logSetupDryRun({
    tag,
    worktreeRoot,
    mainRoot,
    slug,
    sourceDb,
    destDb,
    databaseUrl,
    e2eDatabaseUrl: buildDestinationTestDatabaseUrl(databaseUrl, slug),
    recreateDb: argv.recreateDb,
    dbeaver: argv.dbeaver,
    forceDbeaver: argv.forceDbeaver,
    ports: previewWorktreePorts(slug),
    install: argv.install,
    migrate: argv.migrate,
    start: argv.start,
    verify: argv.verify,
    workspacePath: join(mainRoot, "job-tracker.code-workspace"),
  });
} else {
  cloneWorktreeDatabase({
    tag,
    slug,
    sourceDb,
    destDb,
    worktreeRoot,
    recreateDb: argv.recreateDb,
  });

  const testDatabaseUrl = buildDestinationTestDatabaseUrl(databaseUrl, slug);
  cloneWorktreeTestDatabase({
    tag,
    slug,
    testDbName: testDbNameForSlug(slug),
    worktreeRoot,
    recreateDb: argv.recreateDb,
  });

  const allocatedPorts = registerWorktreePorts(slug);
  const { apiEnvPath, webEnvPath, storybookEnvPath, extensionEnvPath } =
    writeWorktreeAppEnvs({
      worktreeRoot,
      mainRoot,
      ports: allocatedPorts,
      databaseUrl,
      e2eDatabaseUrl: testDatabaseUrl,
    });

  addWorktreeToWorkspace({ mainRoot, slug, worktreeRoot, tag });

  if (argv.dbeaver) {
    addWorktreeDBeaverConnection({
      tag,
      slug,
      databaseUrl,
      force: argv.forceDbeaver,
    });
  }

  logSetupSummary({
    tag,
    apiEnvPath,
    webEnvPath,
    storybookEnvPath,
    extensionEnvPath,
    ports: allocatedPorts,
    databaseUrl,
    e2eDatabaseUrl: testDatabaseUrl,
    destDb,
  });

  runWorktreePostSetup({
    tag,
    repoRoot: root,
    ports: allocatedPorts,
    install: argv.install,
    migrate: argv.migrate,
    start: argv.start,
    verify: argv.verify,
  });
}
