import { serverEnv } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { DataSource } from "typeorm";

import { buildDataSourceOptions } from "./data-source-options";

export async function createTestDataSource(): Promise<DataSource> {
  if (!serverEnv.DATABASE_INTEGRATION_URL) {
    throw new Error(
      "DATABASE_INTEGRATION_URL is required for integration tests",
    );
  }
  const databaseUrl = serverEnv.DATABASE_INTEGRATION_URL;

  const targetDbName = new URL(databaseUrl).pathname.replace(/^\//, "");

  const tryConnect = async (url: string) => {
    const ds = new DataSource(buildDataSourceOptions(url));
    await ds.initialize();
    return ds;
  };

  let dataSource: DataSource;
  const [connectError, ds] = await tryRun(tryConnect(databaseUrl));
  if (connectError) {
    const postgresUrl = databaseUrl.replace(`/${targetDbName}`, "/postgres");
    const adminDs = await tryConnect(postgresUrl);
    await adminDs.query(`CREATE DATABASE "${targetDbName}"`);
    await adminDs.destroy();

    dataSource = await tryConnect(databaseUrl);
  } else {
    dataSource = ds;
  }

  await dataSource.query("DROP SCHEMA IF EXISTS public CASCADE");
  await dataSource.query("CREATE SCHEMA public");
  await dataSource.runMigrations({ transaction: "each" });

  return dataSource;
}
