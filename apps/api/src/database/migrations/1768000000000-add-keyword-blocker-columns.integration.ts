import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { AddKeywordBlockerColumns1768000000000 } from "./1768000000000-add-keyword-blocker-columns";

const hasDbUrl = () => !!(process.env.DATABASE_INTEGRATION_URL || process.env.DATABASE_URL);

describe.runIf(hasDbUrl())("AddKeywordBlockerColumns migration", () => {
  const MIGRATION_NAME = "AddKeywordBlockerColumns1768000000000";

  async function cleanColumns(dataSource: import("typeorm").DataSource) {
    await dataSource.query(`ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "blocked_companies"`);
    await dataSource.query(`ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "blocked_keywords"`);
  }

  async function cleanMigrationRecord(dataSource: import("typeorm").DataSource) {
    await dataSource.query(`DELETE FROM "migrations" WHERE "name" = '${MIGRATION_NAME}'`);
  }

  it("migration up and down work correctly", async () => {
    const { DataSource } = await import("typeorm");
    const url = process.env.DATABASE_INTEGRATION_URL || process.env.DATABASE_URL!;

    const dataSource = new DataSource({ type: "postgres", url, migrations: [AddKeywordBlockerColumns1768000000000] });

    await dataSource.initialize();

    try {
      await cleanColumns(dataSource);
      await cleanMigrationRecord(dataSource);

      await dataSource.runMigrations();
      const queryRunner = dataSource.createQueryRunner();

      const columns = await queryRunner.getTable("user_settings");

      expect(columns?.findColumnByName("blocked_keywords")).toBeDefined();
      expect(columns?.findColumnByName("blocked_companies")).toBeDefined();

      await queryRunner.release();

      await dataSource.undoLastMigration();

      const queryRunner2 = dataSource.createQueryRunner();
      const columnsAfterRollback = await queryRunner2.getTable("user_settings");

      expect(columnsAfterRollback?.findColumnByName("blocked_keywords")).toBeUndefined();
      expect(columnsAfterRollback?.findColumnByName("blocked_companies")).toBeUndefined();

      await queryRunner2.release();
    } finally {
      await dataSource.destroy();
    }
  });

  it("migration applies and JSONB values roundtrip", async () => {
    const { DataSource } = await import("typeorm");
    const url = process.env.DATABASE_INTEGRATION_URL || process.env.DATABASE_URL!;

    const dataSource = new DataSource({ type: "postgres", url, migrations: [AddKeywordBlockerColumns1768000000000] });

    await dataSource.initialize();

    try {
      await cleanColumns(dataSource);
      await cleanMigrationRecord(dataSource);

      await dataSource.runMigrations();

      await dataSource.query(`SET session_replication_role = 'replica'`);

      await dataSource.query(
        `INSERT INTO "user_settings" ("user_id", "blocked_keywords", "blocked_companies") VALUES ($1, $2, $3)`,
        [
          "test-user-176800",
          JSON.stringify([{ keyword: "test", scope: "TITLE", matchMode: "PARTIAL" }]),
          JSON.stringify(["Acme Corp"]),
        ],
      );

      const row = await dataSource.query(
        `SELECT "blocked_keywords", "blocked_companies" FROM "user_settings" WHERE "user_id" = $1`,
        ["test-user-176800"],
      );

      expect(row).toHaveLength(1);
      expect(row[0].blocked_keywords).toEqual([{ keyword: "test", scope: "TITLE", matchMode: "PARTIAL" }]);
      expect(row[0].blocked_companies).toEqual(["Acme Corp"]);

      await dataSource.query(`DELETE FROM "user_settings" WHERE "user_id" = 'test-user-176800'`);

      await dataSource.query(`SET session_replication_role = 'origin'`);

      await dataSource.undoLastMigration();
    } finally {
      await dataSource.destroy();
    }
  });
});
