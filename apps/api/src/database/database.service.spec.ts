// integration
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "drizzle-orm";
import type { DatabaseService } from "./database.service";
import { DatabasePoolInterceptor } from "@api/observability/database-pool.interceptor";
import { RequestMetricsContext } from "@api/observability/request-metrics.context";

const hasDb = !!process.env.DATABASE_URL;

describe("DatabaseService (integration)", () => {
  let service: DatabaseService;

  beforeAll(async () => {
    if (!hasDb) return;
    const { DatabaseService: DatabaseServiceClass } =
      await import("./database.service");
    const metrics = new RequestMetricsContext();
    service = new DatabaseServiceClass(new DatabasePoolInterceptor(metrics));
    service.onModuleInit();
  });

  afterAll(async () => {
    if (!hasDb) return;
    await service.onModuleDestroy();
  });

  it.skipIf(!hasDb)("executes a raw SQL query against PostgreSQL", async () => {
    const result = await service.db.execute(sql`SELECT 1 AS value`);
    expect(result).toBeDefined();
    expect(result.rows).toBeDefined();
    expect(result.rows[0]).toEqual({ value: 1 });
  });
});
