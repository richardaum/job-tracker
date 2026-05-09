/**
 * Records pending TypeORM migrations as executed without running their `up()` SQL.
 * Use only when the database schema already matches the migration files (for example after manual DDL or a restore).
 */
import "reflect-metadata";

import { resolve } from "node:path";

import { config } from "dotenv";
import { DataSource } from "typeorm";

import { buildDataSourceOptions } from "./data-source-options";

config({ path: resolve(process.cwd(), ".env") });

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }
  const dataSource = new DataSource(buildDataSourceOptions(url));
  await dataSource.initialize();
  const executed = await dataSource.runMigrations({
    fake: true,
    transaction: "each",
  });
  for (const m of executed) {
    console.log(`Marked as applied (fake): ${m.name}`);
  }
  if (executed.length === 0) {
    console.log("No pending migrations to mark; journal already matches code.");
  }
  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
