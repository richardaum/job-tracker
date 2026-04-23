import { DataSource } from "typeorm";

import { buildDataSourceOptions } from "./data-source-options";

/**
 * Drops `public` and reapplies TypeORM migrations — for integration tests only.
 */
export async function resetPublicSchemaAndMigrate(
  databaseUrl: string,
): Promise<DataSource> {
  const dataSource = new DataSource(buildDataSourceOptions(databaseUrl));
  await dataSource.initialize();
  await dataSource.query("DROP SCHEMA IF EXISTS public CASCADE");
  await dataSource.query("CREATE SCHEMA public");
  await dataSource.runMigrations({ transaction: "all" });
  return dataSource;
}
