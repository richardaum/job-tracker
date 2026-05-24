import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRefreshJti1767910000000 implements MigrationInterface {
  name = "AddUserRefreshJti1767910000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "refresh_jti" UUID NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_jti"`);
  }
}
