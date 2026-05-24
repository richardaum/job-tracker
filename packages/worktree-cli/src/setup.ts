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
  console.log("[worktree:setup] node_modules missing, running pnpm install...");
  const result = spawnSync("pnpm", ["install"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const { default: yargs } = await import("yargs");
const { addWorktreeDBeaverConnection } = await import("./dbeaver.ts");
const { worktreeEnv } = await import("./env.ts");
const {
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
  writeWorktreeAppEnvs,
} = await import("./lib.ts");

const tag = WORKTREE_SETUP_TAG;

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
    default: true,
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
  .option("open", {
    type: "boolean",
    default: true,
    description:
      "Open web app in the default browser (default: same as --verify)",
  })
  .strict()
  .check((args) => {
    if (args.forceDbeaver && !args.dbeaver) {
      throw new Error("--force-dbeaver requires --dbeaver");
    }
    return true;
  })
  .parse();

assertGitWorktree(repoRoot, tag);
const worktreeRoot = requireWorktreeRoot(repoRoot, tag);
const slug = requireValidSlug(repoRoot, tag);

const sourceDb = worktreeEnv.WORKTREE_SOURCE_DB;
const open = argv.open ?? argv.verify;
if (!sourceDb) {
  console.error(
    `${tag} WORKTREE_SOURCE_DB is required.\n` +
      "  export WORKTREE_SOURCE_DB=job_tracker\n" +
      "  pnpm worktree:setup",
  );
  process.exit(1);
}

const mainRoot = requireMainWorktreeRoot(repoRoot, tag);
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
    open,
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
    repoRoot,
    ports: allocatedPorts,
    install: argv.install,
    migrate: argv.migrate,
    start: argv.start,
    verify: argv.verify,
    open,
  });
}
