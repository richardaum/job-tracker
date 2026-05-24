import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserActiveTokenVersion1767910000000 implements MigrationInterface {
  name = "AddUserActiveTokenVersion1767910000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "token_version"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
  }
}
