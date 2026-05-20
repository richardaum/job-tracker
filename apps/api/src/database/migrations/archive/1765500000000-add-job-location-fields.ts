import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobLocationFields1765500000000 implements MigrationInterface {
  name = "AddJobLocationFields1765500000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "location" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "work_region" text NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "work_region"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "location"`,
    );
  }
}
