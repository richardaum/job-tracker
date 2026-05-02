import type { MigrationInterface, QueryRunner } from "typeorm";

export class ImportRunStatusInProgress1755100000000 implements MigrationInterface {
  name = "ImportRunStatusInProgress1755100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE "public"."import_run_status" ADD VALUE IF NOT EXISTS 'in_progress';
`);
  }

  /** Postgres cannot drop enum variants without a destructive migration — keep no-op. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- MigrationInterface signature
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
