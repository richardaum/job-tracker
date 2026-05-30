import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceRunErrorMessage1768070000000 implements MigrationInterface {
  name = "AddSourceRunErrorMessage1768070000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "source_runs" ADD COLUMN "error_message" text`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "source_runs" DROP COLUMN "error_message"`,
    );
  }
}
