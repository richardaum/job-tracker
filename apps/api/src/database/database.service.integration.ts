// integration
import { serverEnv } from "@api/env/server";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildDataSourceOptions } from "./data-source-options";

const hasDb = !!serverEnv.DATABASE_INTEGRATION_URL;

describe("PostgreSQL connection (integration)", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    if (!hasDb) return;
    dataSource = new DataSource(
      buildDataSourceOptions(serverEnv.DATABASE_INTEGRATION_URL!),
    );
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (!hasDb) return;
    await dataSource.destroy();
  });

  it.skipIf(!hasDb)("executes a raw SQL query", async () => {
    const rows = (await dataSource.query("SELECT 1 AS value")) as Array<{
      value: number;
    }>;
    expect(rows[0]?.value).toBe(1);
  });
});
