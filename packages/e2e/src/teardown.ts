#!/usr/bin/env node

/**
 * E2E environment teardown — stops the isolated API, restores env, drops the database.
 *
 * Run after Playwright tests complete (always, even on test failure).
 * Uses `pg` for DB drop. No psql/dropdb/Docker dependency.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

import { tryRun } from "@job-tracker/try-run";
import { isGitWorktreeCheckout } from "@job-tracker/worktree-cli";
import { parse } from "dotenv";
import pg from "pg";

import { e2eEnv } from "./index.ts";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");
const WEB_ENV_LOCAL_PATH = resolve(REPO_ROOT, "apps/web/.env.local");
const API_ENV_PATH = resolve(REPO_ROOT, "apps/api/.env");

async function dropDatabase(): Promise<void> {
  if (!existsSync(API_ENV_PATH)) return;
  const apiEnv = parse(readFileSync(API_ENV_PATH, "utf8"));
  const dbUrl = apiEnv.DATABASE_URL;
  if (!dbUrl) return;

  const postgresUrl = new URL(dbUrl);
  postgresUrl.pathname = "/postgres";

  const client = new pg.Client({ connectionString: postgresUrl.toString() });
  try {
    await client.connect();
    const exists = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [e2eEnv.E2E_DB_NAME]);
    if (exists.rows.length === 0) {
      console.log(`[e2e:teardown] Database ${e2eEnv.E2E_DB_NAME} does not exist — skipping.`);
      return;
    }
    await client.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid()`,
      [e2eEnv.E2E_DB_NAME],
    );
    await client.query(`DROP DATABASE "${e2eEnv.E2E_DB_NAME}"`);
    console.log(`[e2e:teardown] Dropped database ${e2eEnv.E2E_DB_NAME}`);
  } finally {
    await client.end();
  }
}

async function main() {
  const startedAt = Date.now();

  if (isGitWorktreeCheckout(REPO_ROOT)) {
    console.log("[e2e:teardown] Worktree detected — skipping teardown.");
    if (existsSync(WEB_ENV_LOCAL_PATH)) {
      unlinkSync(WEB_ENV_LOCAL_PATH);
      console.log(`[e2e:teardown] Removed stale ${WEB_ENV_LOCAL_PATH}`);
    }
    return;
  }

  // 1. Kill E2E API (by port — kills actual nest process, not just pnpm parent)
  const [killErr] = tryRun(() => {
    execSync(`lsof -ti :${e2eEnv.E2E_API_PORT} | xargs kill -9 2>/dev/null`, { stdio: "ignore" });
  });
  if (!killErr) {
    console.log(`[e2e:teardown] Killed E2E API on port ${e2eEnv.E2E_API_PORT}`);
  }

  // 2. Remove web .env.local
  if (existsSync(WEB_ENV_LOCAL_PATH)) {
    unlinkSync(WEB_ENV_LOCAL_PATH);
    console.log(`[e2e:teardown] Removed ${WEB_ENV_LOCAL_PATH}`);
  }

  // 3. Drop E2E database
  await dropDatabase();

  console.log(`[e2e:teardown] Done (${Date.now() - startedAt}ms)`);
}

main().catch((err) => {
  console.error(`[e2e:teardown] FAILED: ${(err as Error).message}`);
});
