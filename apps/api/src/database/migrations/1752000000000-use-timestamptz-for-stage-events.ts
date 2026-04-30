import type { MigrationInterface, QueryRunner } from "typeorm";

export class UseTimestamptzForStageEvents1752000000000 implements MigrationInterface {
  name = "UseTimestamptzForStageEvents1752000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_stage_events"
         ALTER COLUMN "schedule_at" TYPE timestamptz
         USING ("schedule_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_stage_events"
         ALTER COLUMN "schedule_at" TYPE timestamp
         USING ("schedule_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
  }
}
