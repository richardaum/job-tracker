import type { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeRoleEnumPascalcase1768140000000 implements MigrationInterface {
  name = "NormalizeRoleEnumPascalcase1768140000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "role" RENAME VALUE 'user' TO 'User'`);
    await queryRunner.query(`ALTER TYPE "role" RENAME VALUE 'admin' TO 'Admin'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "role" RENAME VALUE 'User' TO 'user'`);
    await queryRunner.query(`ALTER TYPE "role" RENAME VALUE 'Admin' TO 'admin'`);
  }
}
