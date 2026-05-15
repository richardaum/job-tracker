import { MigrationInterface, QueryRunner } from "typeorm";

export class DropImportRunsExecutorPlanJson1755200000000 implements MigrationInterface {
  name = "DropImportRunsExecutorPlanJson1755200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "import_runs"
      DROP COLUMN IF EXISTS "executor_plan_json";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "import_runs"
      ADD COLUMN IF NOT EXISTS "executor_plan_json" text NULL;
    `);
  }
}
