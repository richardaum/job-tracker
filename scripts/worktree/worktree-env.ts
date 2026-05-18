#!/usr/bin/env node

import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  allocatePorts,
  buildDestinationDatabaseUrl,
  buildWorktreeEnv,
  cloneDatabase,
  dbNameForSlug,
  deriveSlug,
  extractRequiredSecrets,
  formatEnvWorktree,
  isGitWorktreeCheckout,
  parseDatabaseName,
  readApiEnvFromPath,
  readGlobalRegistry,
  resolveMainWorktreeRoot,
  resolveWorktreeRoot,
  validateSlug,
  writeGlobalRegistry,
  writeSlugRegistry,
} from "./worktree-lib.ts";

const tag = "[worktree:env]";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

function fail(message: string): never {
  console.error(`${tag} ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): { sourceDb?: string; recreateDb: boolean } {
  let sourceDb = process.env.WORKTREE_SOURCE_DB?.trim();
  let recreateDb = false;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--recreate-db") {
      recreateDb = true;
      continue;
    }
    if (arg === "--source-db" && argv[i + 1]) {
      sourceDb = argv[++i]?.trim();
      continue;
    }
    if (arg.startsWith("--source-db=")) {
      sourceDb = arg.slice("--source-db=".length).trim();
    }
  }
  return { sourceDb, recreateDb };
}

function main(): void {
  if (!isGitWorktreeCheckout(root)) {
    fail(
      "Refusing to run on the main checkout. Create a git worktree first, then run from that path.",
    );
  }

  const worktreeRoot = resolveWorktreeRoot(root);
  if (!worktreeRoot) fail("Could not resolve worktree root.");

  const slug = deriveSlug(root);
  if (!slug || !validateSlug(slug)) {
    fail(
      `Invalid slug derived from path/branch. Use a kebab-case directory name (≤16 chars). Got: ${JSON.stringify(slug)}`,
    );
  }

  const { sourceDb, recreateDb } = parseArgs(process.argv);
  if (!sourceDb) {
    fail(
      "WORKTREE_SOURCE_DB is required.\n" +
        "  export WORKTREE_SOURCE_DB=job_tracker\n" +
        "  pnpm worktree:env\n" +
        "Or: pnpm worktree:env -- --source-db job_tracker",
    );
  }

  const mainRoot = resolveMainWorktreeRoot(root);
  if (!mainRoot) {
    fail("Could not resolve main worktree (source for apps/api/.env secrets).");
  }

  const sourceApiEnvPath = join(mainRoot, "apps/api/.env");
  if (!existsSync(sourceApiEnvPath)) {
    fail(`Missing API env at ${sourceApiEnvPath}`);
  }
  const sourceApiEnv = readApiEnvFromPath(sourceApiEnvPath);

  const sourceDatabaseUrl = sourceApiEnv.DATABASE_URL;
  if (!sourceDatabaseUrl) {
    fail(`DATABASE_URL missing in ${sourceApiEnvPath}`);
  }

  const secrets = extractRequiredSecrets(sourceApiEnv);
  const destDb = dbNameForSlug(slug);
  const databaseUrl = buildDestinationDatabaseUrl(sourceDatabaseUrl, slug);

  console.warn(`${tag} slug=${slug}`);
  console.warn(`${tag} cloning ${sourceDb} → ${destDb}`);
  cloneDatabase(sourceDb, destDb, {
    force: recreateDb,
    repoRoot: worktreeRoot,
  });

  const registry = readGlobalRegistry();
  const ports = allocatePorts(slug, registry);
  registry.slugs[slug] = { ...ports, updatedAt: new Date().toISOString() };
  writeGlobalRegistry(registry);
  writeSlugRegistry(slug, ports);

  const envMap = buildWorktreeEnv({ slug, ports, secrets, databaseUrl });

  const envPath = join(worktreeRoot, ".env.worktree");
  writeFileSync(envPath, formatEnvWorktree(envMap), "utf8");

  console.warn(`${tag} wrote ${envPath}`);
  console.warn(`${tag} API  http://localhost:${ports.api}`);
  console.warn(`${tag} Web  http://localhost:${ports.web}`);
  console.warn(`${tag} SB   http://localhost:${ports.storybook}`);
  console.warn(`${tag} WXT  http://localhost:${ports.wxt}`);
  console.warn(`${tag} DB   ${parseDatabaseName(databaseUrl) ?? destDb}`);
  console.warn(`${tag} Next: pnpm install (if needed) && pnpm pm2:start`);
  console.warn(
    `${tag} Migrations are not run automatically — run API migrations if schema drifted.`,
  );
}

main();
