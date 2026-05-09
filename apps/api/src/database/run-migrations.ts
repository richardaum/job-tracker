import "reflect-metadata";

import { resolve } from "node:path";

import { config } from "dotenv";
import { DataSource } from "typeorm";

import { buildDataSourceOptions } from "./data-source-options";

config({ path: resolve(process.cwd(), ".env") });

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required to run migrations.");
    process.exit(1);
  }
  const dataSource = new DataSource(buildDataSourceOptions(url));
  await dataSource.initialize();
  const executed = await dataSource.runMigrations({ transaction: "each" });
  for (const m of executed) {
    console.log(`Ran migration: ${m.name}`);
  }
  if (executed.length === 0) {
    console.log("No pending migrations.");
  }
  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
