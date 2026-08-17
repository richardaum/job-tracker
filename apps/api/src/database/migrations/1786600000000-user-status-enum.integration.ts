import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DataSource, QueryRunner } from "typeorm";
import { DataSource as TypeOrmDataSource } from "typeorm";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { apiEnv } from "@api/env/server";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";

type UsersStatusColumn = { data_type: string; is_nullable: "YES" | "NO"; column_default: string | null };

describe("Migration: UserStatusEnum", () => {
  let ds: DataSource;

  beforeEach(async () => {
    const dbUrl = apiEnv.DATABASE_INTEGRATION_URL || apiEnv.DATABASE_URL;
    ds = new TypeOrmDataSource({
      ...buildDataSourceOptions(dbUrl, { ssl: apiEnv.DATABASE_SSL_ENABLED }),
      migrationsRun: true,
    });

    await ds.initialize();
  });

  afterEach(async () => {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
  });

  it("adds a status column with enum type, NOT NULL, defaulting to active", async () => {
    const queryRunner = ds.createQueryRunner();
    try {
      const column = await findStatusColumn(queryRunner);

      expect(column).toBeDefined();
      expect(column?.data_type).toBe("USER-DEFINED");
      expect(column?.is_nullable).toBe("NO");
      expect(column?.column_default).toMatch(/active/i);
    } finally {
      await queryRunner.release();
    }
  });

  it("migration can be reversed via down method, backfilling active from status", async () => {
    const UserStatusEnum1786600000000 = (await import("./1786600000000-user-status-enum")).UserStatusEnum1786600000000;
    const migration = new UserStatusEnum1786600000000();
    const queryRunner = ds.createQueryRunner();

    try {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const user = await insertUserWithAuthAccount(ds, {
        email: uniqueEmail,
        name: "Test User",
        providerAccountId: `google-${Date.now()}`,
      });

      expect(await findStatusColumn(queryRunner)).toBeDefined();

      await migration.down(queryRunner);

      expect(await findStatusColumn(queryRunner)).toBeUndefined();
      const [activeRow] = await queryRunner.query(`SELECT "active" FROM "users" WHERE "id" = $1`, [user.id]);
      expect(activeRow.active).toBe(true);

      await migration.up(queryRunner);

      expect(await findStatusColumn(queryRunner)).toBeDefined();
      const [statusRow] = await queryRunner.query(`SELECT "status" FROM "users" WHERE "id" = $1`, [user.id]);
      expect(statusRow.status).toBe("Active");
    } finally {
      await queryRunner.release();
    }
  });
});

async function findStatusColumn(queryRunner: QueryRunner) {
  const [column]: UsersStatusColumn[] = await queryRunner.query(
    `SELECT data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = current_schema()
       AND table_name = 'users'
       AND column_name = 'status'`,
  );

  return column;
}
