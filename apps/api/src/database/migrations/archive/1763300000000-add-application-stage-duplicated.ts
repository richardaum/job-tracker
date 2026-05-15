import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationStageDuplicated1763300000000 implements MigrationInterface {
  name = "AddApplicationStageDuplicated1763300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE "public"."application_stage" ADD VALUE IF NOT EXISTS 'duplicated';
`);
  }

  /** Postgres cannot drop enum variants without a destructive migration — keep no-op. */

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
