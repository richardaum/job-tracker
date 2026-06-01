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

  const appliedMigrations = await dataSource.query(`SELECT name, timestamp, id FROM typeorm_migrations ORDER BY id`);

  const allMigrations = dataSource.migrations.map((m) => m.name ?? "unknown");
  const appliedNames = new Set(appliedMigrations.map((r: { name: string }) => r.name));
  const pending = allMigrations.filter((name) => !appliedNames.has(name));

  console.log("\n=== Applied migrations ===");
  if (appliedMigrations.length === 0) {
    console.log("  (none)");
  }
  for (const m of appliedMigrations) {
    console.log(`  [${m.timestamp}] ${m.name}`);
  }

  console.log("\n=== Pending migrations ===");
  if (pending.length === 0) {
    console.log("  (none)");
  }
  for (const name of pending) {
    console.log(`  ${name}`);
  }

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
