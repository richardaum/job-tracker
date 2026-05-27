import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRoleEnum1767990000000 implements MigrationInterface {
  name = "AddAdminRoleEnum1767990000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "role" ADD VALUE 'admin'`);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing a value from an enum.
    // The down migration is intentionally a no-op.
  }
}
