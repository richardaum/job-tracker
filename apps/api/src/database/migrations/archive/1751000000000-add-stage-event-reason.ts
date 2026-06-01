import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStageEventReason1751000000000 implements MigrationInterface {
  name = "AddStageEventReason1751000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application_stage_events" ADD COLUMN IF NOT EXISTS "reason" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application_stage_events" DROP COLUMN IF EXISTS "reason"`);
  }
}
