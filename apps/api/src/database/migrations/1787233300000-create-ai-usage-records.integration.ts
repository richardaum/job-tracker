import { createTestDataSource } from "@api/database/test-db";
import { apiEnv } from "@api/env/server";
import type { DataSource, QueryRunner } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CreateAiUsageRecords1787233300000 } from "./1787233300000-create-ai-usage-records";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("Migration: CreateAiUsageRecords", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
  });

  afterAll(async () => dataSource?.destroy());

  it("applies the table, enum, foreign key, and aggregation index", async () => {
    const queryRunner = dataSource.createQueryRunner();
    try {
      expect(await relationExists(queryRunner, "ai_usage_records")).toBe(true);
      const [index] = await queryRunner.query(
        `SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'idx_ai_usage_records_user_source_created_at'`,
      );
      expect(index.indexdef).toMatch(/\(user_id, source, created_at\)/);
    } finally {
      await queryRunner.release();
    }
  });

  it("reverts and reapplies successfully", async () => {
    const migration = new CreateAiUsageRecords1787233300000();
    const queryRunner = dataSource.createQueryRunner();
    try {
      await migration.down(queryRunner);
      expect(await relationExists(queryRunner, "ai_usage_records")).toBe(false);
      await migration.up(queryRunner);
      expect(await relationExists(queryRunner, "ai_usage_records")).toBe(true);
    } finally {
      await queryRunner.release();
    }
  });
});

async function relationExists(queryRunner: QueryRunner, relationName: string): Promise<boolean> {
  const [row] = await queryRunner.query(`SELECT to_regclass($1) AS relation`, [relationName]);
  return row.relation === relationName;
}
