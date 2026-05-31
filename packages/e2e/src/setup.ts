#!/usr/bin/env node

/**
 * E2E environment setup — creates an isolated database and API for Playwright tests.
 *
 * Main checkout only (worktrees already have isolation).
 * Uses `pg` for DB creation + API's migration runner for schema.
 * No psql/pg_dump/Docker dependency.
 */

import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { tryRun } from "@job-tracker/try-run";
import { isGitWorktreeCheckout } from "@job-tracker/worktree-cli";
import { parse } from "dotenv";
import pg from "pg";

import { e2eEnv } from "./index.ts";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");
const WEB_ENV_LOCAL_PATH = resolve(REPO_ROOT, "apps/web/.env.local");
const API_ENV_PATH = resolve(REPO_ROOT, "apps/api/.env");

const TAG = "[e2e:setup]";

type EnvMap = Record<string, string>;

function getSourceDbUrl(apiEnv: EnvMap): URL {
  const dbUrl = apiEnv.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not found in apps/api/.env");
  return new URL(dbUrl);
}

function buildPostgresUrl(sourceUrl: URL): string {
  const url = new URL(sourceUrl.toString());
  url.pathname = "/postgres";
  return url.toString();
}

function buildE2eDbUrl(sourceUrl: URL): string {
  const url = new URL(sourceUrl.toString());
  url.pathname = `/${e2eEnv.E2E_DB_NAME}`;
  return url.toString();
}

async function createDatabase(postgresUrl: string): Promise<void> {
  const client = new pg.Client({ connectionString: postgresUrl });
  try {
    await client.connect();
    const exists = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [e2eEnv.E2E_DB_NAME]);
    if (exists.rows.length > 0) {
      console.log(`${TAG} Dropping existing ${e2eEnv.E2E_DB_NAME}`);
      await client.query(
        `SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid()`,
        [e2eEnv.E2E_DB_NAME],
      );
      await client.query(`DROP DATABASE "${e2eEnv.E2E_DB_NAME}"`);
    }
    console.log(`${TAG} Creating ${e2eEnv.E2E_DB_NAME}`);
    await client.query(`CREATE DATABASE "${e2eEnv.E2E_DB_NAME}"`);
  } finally {
    await client.end();
  }
}

async function runMigrations(e2eDbUrl: string): Promise<void> {
  console.log(`${TAG} Running migrations`);
  execSync(`pnpm --filter @job-tracker/api run db:migrate`, {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: e2eDbUrl },
    stdio: "inherit",
  });
}

function waitForApi(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolvePromise, reject) => {
    function poll() {
      fetch(url)
        .then((res) => {
          if (res.ok) {
            console.log(`${TAG} API ready (${Date.now() - start}ms)`);
            resolvePromise();
          } else {
            retry();
          }
        })
        .catch(() => retry());
    }
    function retry() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`API health check timed out after ${timeoutMs}ms`));
        return;
      }
      setTimeout(poll, 500);
    }
    poll();
  });
}

async function main() {
  const startedAt = Date.now();

  console.log(`${TAG} (1/5) Cleaning up leftover E2E processes`);
  tryRun(() => {
    execSync(`lsof -ti :${e2eEnv.E2E_API_PORT} | xargs kill -9 2>/dev/null`, { stdio: "ignore" });
  });

  if (isGitWorktreeCheckout(REPO_ROOT)) {
    console.log(`${TAG} Worktree detected — using existing API and DB.`);
    if (existsSync(WEB_ENV_LOCAL_PATH)) {
      unlinkSync(WEB_ENV_LOCAL_PATH);
      console.log(`${TAG} Removed stale ${WEB_ENV_LOCAL_PATH}`);
    }
    console.log(`${TAG} Done (${Date.now() - startedAt}ms)`);
    return;
  }

  if (!existsSync(API_ENV_PATH)) {
    throw new Error(`API .env not found at ${API_ENV_PATH}`);
  }
  const apiEnv = parse(readFileSync(API_ENV_PATH, "utf8"));
  const sourceUrl = getSourceDbUrl(apiEnv);
  const postgresUrl = buildPostgresUrl(sourceUrl);
  const e2eDbUrl = buildE2eDbUrl(sourceUrl);
  const e2eApiUrl = `http://localhost:${e2eEnv.E2E_API_PORT}`;

  console.log(`${TAG} (2/5) Creating database ${e2eEnv.E2E_DB_NAME}`);
  await createDatabase(postgresUrl);

  console.log(`${TAG} (3/5) Running migrations`);
  await runMigrations(e2eDbUrl);

  // Seed bypass user so the API's AUTH_BYPASS_ENABLED works without a DB round-trip failure
  const seedClient = new pg.Client({ connectionString: e2eDbUrl });
  try {
    await seedClient.connect();
    await seedClient.query(
      `INSERT INTO users (id, email, name, role, google_id, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [
        "00000000-0000-0000-0000-000000000000",
        e2eEnv.E2E_BYPASS_EMAIL,
        "E2E Test User",
        "user",
        "dev-bypass-e2e",
        null,
      ],
    );
  } finally {
    await seedClient.end();
  }

  console.log(`${TAG} (4/5) Writing ${WEB_ENV_LOCAL_PATH}`);
  writeFileSync(
    WEB_ENV_LOCAL_PATH,
    `# E2E isolated API — generated by packages/e2e\nNEXT_PUBLIC_API_URL=${e2eApiUrl}\n`,
    "utf8",
  );

  console.log(`${TAG} (5/5) Starting E2E API on port ${e2eEnv.E2E_API_PORT}`);
  spawn("pnpm", ["--filter", "@job-tracker/api", "run", "dev"], {
    cwd: REPO_ROOT,
    stdio: "ignore",
    env: {
      ...process.env,
      NODE_ENV: "development",
      NODE_OPTIONS: `--import ${resolve(REPO_ROOT, "apps/api/node_modules/tsx/dist/loader.mjs")}`,
      DATABASE_URL: e2eDbUrl,
      PORT: String(e2eEnv.E2E_API_PORT),
      AUTH_BYPASS_ENABLED: "true",
      GOOGLE_CLIENT_ID: apiEnv.GOOGLE_CLIENT_ID ?? "",
      GOOGLE_CLIENT_SECRET: apiEnv.GOOGLE_CLIENT_SECRET ?? "",
      GOOGLE_CALLBACK_URL: `http://localhost:${e2eEnv.E2E_API_PORT}/auth/google/callback`,
      JWT_ACCESS_SECRET: apiEnv.JWT_ACCESS_SECRET ?? "",
      JWT_REFRESH_SECRET: apiEnv.JWT_REFRESH_SECRET ?? "",
      WEB_URL: `http://localhost:${e2eEnv.E2E_WEB_PORT}`,
      OPENAI_API_KEY: apiEnv.OPENAI_API_KEY ?? "",
      DEV_AUTH_BYPASS_EMAIL: e2eEnv.E2E_BYPASS_EMAIL,
      RATE_LIMIT_DISABLED: "true",
    },
  });

  await waitForApi(`${e2eApiUrl}/health`, 60_000);

  console.log(`${TAG} Done (${Date.now() - startedAt}ms)`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(`${TAG} FAILED: ${(err as Error).message}`);
    process.exit(1);
  },
);
