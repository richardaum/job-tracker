// integration
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildDataSourceOptions } from "./data-source-options";

const hasDb = !!process.env.DATABASE_URL;

describe("PostgreSQL connection (integration)", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    if (!hasDb) return;
    dataSource = new DataSource(
      buildDataSourceOptions(process.env.DATABASE_URL as string),
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
