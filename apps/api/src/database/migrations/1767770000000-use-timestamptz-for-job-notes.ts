import type { MigrationInterface, QueryRunner } from "typeorm";

export class UseTimestamptzForJobNotes1767770000000 implements MigrationInterface {
  name = "UseTimestamptzForJobNotes1767770000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_notes"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_notes"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_notes"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_notes"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
  }
}
