#!/usr/bin/env tsx

import "reflect-metadata";

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { migrations as allMigrations } from "@api/database/migrations";
import { tryRun } from "@job-tracker/try-run";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

config({ path: path.resolve(process.cwd(), ".env") });

const MIGRATIONS_DIR = path.resolve(process.cwd(), "src/database/migrations");

function findPgDump(): string {
  const fromPath = findInPath("pg_dump");
  if (fromPath) return fromPath;

  const searchPaths = [
    "/opt/homebrew/opt/libpq/bin",
    "/usr/local/opt/libpq/bin",
    "/opt/homebrew/bin",
    "/usr/local/bin",
  ];

  for (const dir of searchPaths) {
    const candidate = path.join(dir, "pg_dump");
    if (existsSync(candidate)) {
      process.env.PATH = `${dir}${path.delimiter}${process.env.PATH ?? ""}`;
      return candidate;
    }
  }

  throw new Error("pg_dump not found in PATH. Install PostgreSQL client tools: brew install libpq");
}

function findInPath(name: string): string | null {
  const dirs = (process.env.PATH ?? "").split(path.delimiter);
  for (const dir of dirs) {
    const candidate = path.join(dir, name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const PG_DUMP = findPgDump();

interface CliArgs {
  dryRun: boolean;
  write: boolean;
  name: string;
  timestamp: number;
}

function parseArgs(): CliArgs {
  const raw = hideBin(process.argv).filter((a) => a !== "--");
  const parsed = yargs(raw)
    .option("dry-run", {
      alias: "d",
      type: "boolean",
      default: false,
      description: "Verify preconditions only; skip temp DB + pg_dump",
    })
    .option("write", {
      alias: "w",
      type: "boolean",
      default: false,
      description: "Write the squashed migration file to disk",
    })
    .option("name", {
      type: "string",
      default: "baseline-squashed",
      description: "Output migration file slug",
    })
    .option("timestamp", {
      type: "number",
      default: Date.now(),
      description: "Output migration timestamp",
    })
    .help()
    .parseSync();

  if (!Number.isFinite(parsed.timestamp) || parsed.timestamp <= 0) {
    throw new Error("Invalid --timestamp. Provide a valid positive integer.");
  }

  return {
    dryRun: parsed.dryRun,
    write: parsed.write,
    name: parsed.name,
    timestamp: parsed.timestamp,
  };
}

function pgDump(sourceUrl: string, dbName: string): string {
  const url = new URL(sourceUrl);
  const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;
  const port = url.port || "5432";
  const user = decodeURIComponent(url.username || "postgres");
  const password = decodeURIComponent(url.password || "postgres");

  return execSync(
    [
      `"${PG_DUMP}"`,
      `-h "${host}"`,
      `-p "${port}"`,
      `-U "${user}"`,
      `-d "${dbName}"`,
      "--schema-only",
      "--no-owner",
      "--no-privileges",
      "--no-comments",
    ].join(" "),
    {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "inherit"],
      env: { ...process.env, PGPASSWORD: password },
    },
  );
}

function buildUrl(template: string, dbName: string): string {
  const url = new URL(template);
  url.pathname = `/${dbName}`;
  return url.toString();
}

async function createDatabase(sourceUrl: string, dbName: string): Promise<void> {
  const ds = new DataSource(buildDataSourceOptions(buildUrl(sourceUrl, "postgres")));
  await ds.initialize();
  const [error] = await tryRun(ds.query(`CREATE DATABASE "${dbName}"`));
  await ds.destroy();
  if (error) throw error;
}

async function dropDatabase(sourceUrl: string, dbName: string): Promise<void> {
  const ds = new DataSource(buildDataSourceOptions(buildUrl(sourceUrl, "postgres")));
  await ds.initialize();

  const [, terminateErr] = await tryRun(
    ds.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
       FROM pg_stat_activity
       WHERE pg_stat_activity.datname = $1
         AND pid <> pg_backend_pid()`,
      [dbName],
    ),
  );
  if (terminateErr) {
    console.warn(`[squash] warning: failed to terminate connections: ${String(terminateErr)}`);
  }

  const [dropError] = await tryRun(ds.query(`DROP DATABASE "${dbName}"`));
  await ds.destroy();
  if (dropError) throw dropError;
}

function parseStatements(dump: string): string[] {
  const lines = dump.split("\n");
  const statements: string[] = [];
  let buf: string[] = [];

  for (const line of lines) {
    if (buf.length === 0 && line.trim() === "") continue;
    buf.push(line);
    if (line.trimEnd().endsWith(";")) {
      const stmt = stripPgComments(buf.join("\n")).trim();
      buf = [];
      if (stmt && !shouldSkip(stmt)) {
        statements.push(stmt);
      }
    }
  }

  return statements;
}

function stripPgComments(stmt: string): string {
  return stmt
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .filter((l) => !l.trimStart().startsWith("\\"))
    .join("\n");
}

function shouldSkip(stmt: string): boolean {
  const upper = stmt.toUpperCase();
  return (
    upper.startsWith("SET ") ||
    upper.startsWith("SELECT ") ||
    upper.startsWith("CREATE EXTENSION") ||
    upper.startsWith("COMMENT ON") ||
    stmt.includes("typeorm_migrations")
  );
}

function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
}

function escapeSql(sql: string): string {
  return sql.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function generateMigrationFile(statements: string[], className: string): string {
  const now = new Date().toISOString();

  const header = [
    'import type { MigrationInterface, QueryRunner } from "typeorm";',
    "",
    `export class ${className} implements MigrationInterface {`,
    `  name = "${className}";`,
    "",
    "  public async up(queryRunner: QueryRunner): Promise<void> {",
    `    // Schema dumped at ${now}`,
    "    // Generated by: pnpm db:migrate:squash",
    "",
  ].join("\n");

  const body = statements
    .map((sql) => `    await queryRunner.query(\`${escapeSql(sql)}\`);`)
    .join("\n\n");

  const footer = [
    "",
    "  }",
    "",
    "  public async down(_queryRunner: QueryRunner): Promise<void> {",
    "    // Intentionally empty: squashed baseline migration is not reversible.",
    "  }",
    "}",
    "",
  ].join("\n");

  return header + body + footer;
}

async function verifyMigrationsApplied(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env");

  const ds = new DataSource(buildDataSourceOptions(url));
  await ds.initialize();

  const [tableError, tableResult] = await tryRun(
    ds.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'typeorm_migrations')`,
    ),
  );
  if (tableError) {
    await ds.destroy();
    throw tableError;
  }

  if (!tableResult[0]?.exists) {
    console.log("[squash] typeorm_migrations table does not exist — skipping verification");
    await ds.destroy();
    return;
  }

  const [appliedError, applied] = await tryRun(
    ds.query(`SELECT name FROM typeorm_migrations ORDER BY timestamp`),
  );
  if (appliedError) {
    await ds.destroy();
    throw appliedError;
  }

  const appliedNames = new Set((applied as { name: string }[]).map((r) => r.name));

  const allNames = allMigrations.map((Ctor) => new Ctor().name);

  const pending = allNames.filter((n) => !appliedNames.has(n));

  await ds.destroy();

  if (pending.length > 0) {
    console.error(`[squash] ERROR: ${pending.length} migration(s) not applied on source DB:`);
    for (const m of pending) console.error(`  - ${m}`);
    console.error("[squash] Run pnpm db:migrate first, then retry.");
    process.exit(1);
  }

  console.log(`[squash] verified: all ${allNames.length} migrations are applied`);
}

async function main(): Promise<void> {
  const args = parseArgs();

  const sourceUrl = process.env.DATABASE_URL;
  if (!sourceUrl) throw new Error("DATABASE_URL is not set in .env");

  await verifyMigrationsApplied();

  if (args.dryRun) {
    console.log(
      `[squash] dry-run: would squash ${allMigrations.length} migration(s) into a single baseline`,
    );
    console.log("[squash] dry-run passed — re-run without --dry-run to execute.");
    return;
  }

  const tempDbName = `jt_squash_${Date.now()}`;

  console.log(`[squash] creating temp database: ${tempDbName}`);
  await createDatabase(sourceUrl, tempDbName);

  const [dumpError, output] = await tryRun(runDump(sourceUrl, tempDbName, args));

  console.log("[squash] dropping temp database...");
  const [, dropErr] = await tryRun(dropDatabase(sourceUrl, tempDbName));
  if (dropErr) {
    console.warn(`[squash] warning: failed to drop temp database: ${String(dropErr)}`);
  }

  if (dumpError) throw dumpError;
  console.log(output);
}

async function runDump(sourceUrl: string, tempDbName: string, args: CliArgs): Promise<string> {
  console.log("[squash] running migrations on temp database...");
  const tempUrl = buildUrl(sourceUrl, tempDbName);
  const ds = new DataSource(buildDataSourceOptions(tempUrl));
  await ds.initialize();

  const [migrateError, result] = await tryRun(ds.runMigrations({ transaction: "each" }));
  await ds.destroy();

  if (migrateError) throw migrateError;

  const migrationCount = result.length;
  console.log(`[squash] ${migrationCount} migration(s) applied`);

  console.log("[squash] dumping schema via pg_dump...");
  const dump = pgDump(sourceUrl, tempDbName);

  const statements = parseStatements(dump);
  console.log(`[squash] extracted ${statements.length} DDL statement(s)`);

  const classBase = toPascalCase(args.name);
  const className = `SquashedBaseline${classBase}${args.timestamp}`;
  const outputFile = `${args.timestamp}-${args.name}.ts`;
  const outputPath = path.join(MIGRATIONS_DIR, outputFile);

  const content = generateMigrationFile(statements, className);

  if (!args.write) {
    return `[squash] output file: ${outputFile} (re-run with --write to create)`;
  }

  await fs.writeFile(outputPath, content, "utf8");
  return [
    `[squash] wrote ${outputPath}`,
    "[squash] next: update src/database/migrations/index.ts and validate on a clean database.",
  ].join("\n");
}

main().catch((err) => {
  console.error(`[squash] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
