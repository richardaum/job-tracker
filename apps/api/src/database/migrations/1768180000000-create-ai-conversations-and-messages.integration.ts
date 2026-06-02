import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { CreateAiConversationsAndMessages1768180000000 } from "./1768180000000-create-ai-conversations-and-messages";

const hasDbUrl = () => !!(process.env.DATABASE_INTEGRATION_URL || process.env.DATABASE_URL);

describe.runIf(hasDbUrl())("CreateAiConversationsAndMessages migration", () => {
  const MIGRATION_NAME = "CreateAiConversationsAndMessages1768180000000";

  async function cleanTables(dataSource: import("typeorm").DataSource) {
    await dataSource.query(`DROP TABLE IF EXISTS "ai_messages"`);
    await dataSource.query(`DROP TABLE IF EXISTS "ai_conversations"`);
  }

  async function cleanMigrationRecord(dataSource: import("typeorm").DataSource) {
    await dataSource.query(`DELETE FROM "typeorm_migrations" WHERE "name" = '${MIGRATION_NAME}'`);
  }

  async function createDataSource(migrations: (new (...args: unknown[]) => import("typeorm").MigrationInterface)[]) {
    const { DataSource } = await import("typeorm");
    const url = process.env.DATABASE_INTEGRATION_URL || process.env.DATABASE_URL!;
    return new DataSource({
      type: "postgres",
      url,
      migrations,
      migrationsTableName: "typeorm_migrations",
    });
  }

  it("migration up and down work correctly", async () => {
    const dataSource = await createDataSource([CreateAiConversationsAndMessages1768180000000]);
    await dataSource.initialize();

    try {
      await cleanTables(dataSource);
      await cleanMigrationRecord(dataSource);

      await dataSource.runMigrations();
      const queryRunner = dataSource.createQueryRunner();

      const aiConversationsColumns = await queryRunner.getTable("ai_conversations");
      expect(aiConversationsColumns?.findColumnByName("id")).toBeDefined();
      expect(aiConversationsColumns?.findColumnByName("job_id")).toBeDefined();
      expect(aiConversationsColumns?.findColumnByName("user_id")).toBeDefined();
      expect(aiConversationsColumns?.findColumnByName("title")).toBeDefined();
      expect(aiConversationsColumns?.findColumnByName("created_at")).toBeDefined();
      expect(aiConversationsColumns?.findColumnByName("updated_at")).toBeDefined();

      const aiMessagesColumns = await queryRunner.getTable("ai_messages");
      expect(aiMessagesColumns?.findColumnByName("id")).toBeDefined();
      expect(aiMessagesColumns?.findColumnByName("conversation_id")).toBeDefined();
      expect(aiMessagesColumns?.findColumnByName("role")).toBeDefined();
      expect(aiMessagesColumns?.findColumnByName("content")).toBeDefined();
      expect(aiMessagesColumns?.findColumnByName("created_at")).toBeDefined();
      expect(aiMessagesColumns?.findColumnByName("updated_at")).toBeUndefined();

      await queryRunner.release();

      await dataSource.undoLastMigration();

      const queryRunner2 = dataSource.createQueryRunner();
      const aiConversationsAfterRollback = await queryRunner2.getTable("ai_conversations");
      const aiMessagesAfterRollback = await queryRunner2.getTable("ai_messages");

      expect(aiConversationsAfterRollback).toBeUndefined();
      expect(aiMessagesAfterRollback).toBeUndefined();

      await queryRunner2.release();
    } finally {
      await dataSource.destroy();
    }
  });

  it("INSERT and SELECT roundtrip on both tables", async () => {
    const dataSource = await createDataSource([CreateAiConversationsAndMessages1768180000000]);
    await dataSource.initialize();

    try {
      await cleanTables(dataSource);
      await cleanMigrationRecord(dataSource);

      await dataSource.runMigrations();

      await dataSource.query(`SET session_replication_role = 'replica'`);

      await dataSource.query(
        `INSERT INTO "ai_conversations" ("id", "job_id", "user_id", "title") VALUES ($1, $2, $3, $4)`,
        ["conv-1", "job-1", "user-1", "Test conversation"],
      );

      await dataSource.query(
        `INSERT INTO "ai_messages" ("id", "conversation_id", "role", "content") VALUES ($1, $2, $3, $4)`,
        ["msg-1", "conv-1", "user", "Hello world"],
      );

      const convRow = await dataSource.query(
        `SELECT "id", "job_id", "user_id", "title" FROM "ai_conversations" WHERE "id" = $1`,
        ["conv-1"],
      );
      expect(convRow).toHaveLength(1);
      expect(convRow[0].id).toBe("conv-1");
      expect(convRow[0].job_id).toBe("job-1");
      expect(convRow[0].user_id).toBe("user-1");
      expect(convRow[0].title).toBe("Test conversation");

      const msgRow = await dataSource.query(
        `SELECT "id", "conversation_id", "role", "content" FROM "ai_messages" WHERE "id" = $1`,
        ["msg-1"],
      );
      expect(msgRow).toHaveLength(1);
      expect(msgRow[0].id).toBe("msg-1");
      expect(msgRow[0].conversation_id).toBe("conv-1");
      expect(msgRow[0].role).toBe("user");
      expect(msgRow[0].content).toBe("Hello world");

      await dataSource.query(`DELETE FROM "ai_messages" WHERE "id" = 'msg-1'`);
      await dataSource.query(`DELETE FROM "ai_conversations" WHERE "id" = 'conv-1'`);

      await dataSource.query(`SET session_replication_role = 'origin'`);

      await dataSource.undoLastMigration();
    } finally {
      await dataSource.destroy();
    }
  });
});
