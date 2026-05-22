import type { MigrationInterface, QueryRunner } from "typeorm";

export class UseTimestamptzForRemainingEntities1767780000000 implements MigrationInterface {
  name = "UseTimestamptzForRemainingEntities1767780000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "users"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "work_preferences"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_preferences"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "match_analysis"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_analysis"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "companies"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "users"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "work_preferences"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_preferences"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "match_analysis"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_analysis"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );

    await queryRunner.query(
      `ALTER TABLE "companies"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
  }
}
