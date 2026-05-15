import type { MigrationInterface, QueryRunner } from "typeorm";

export class UseTimestamptzForDraftsAndResumes1765200000000 implements MigrationInterface {
  name = "UseTimestamptzForDraftsAndResumes1765200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // draft_applications
    await queryRunner.query(
      `ALTER TABLE "draft_applications"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications"
         ALTER COLUMN "converted_at" TYPE timestamptz
         USING ("converted_at" AT TIME ZONE 'UTC')`,
    );

    // resumes
    await queryRunner.query(
      `ALTER TABLE "resumes"
         ALTER COLUMN "created_at" TYPE timestamptz
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes"
         ALTER COLUMN "updated_at" TYPE timestamptz
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // draft_applications
    await queryRunner.query(
      `ALTER TABLE "draft_applications"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications"
         ALTER COLUMN "converted_at" TYPE timestamp
         USING ("converted_at" AT TIME ZONE 'UTC')`,
    );

    // resumes
    await queryRunner.query(
      `ALTER TABLE "resumes"
         ALTER COLUMN "created_at" TYPE timestamp
         USING ("created_at" AT TIME ZONE 'UTC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes"
         ALTER COLUMN "updated_at" TYPE timestamp
         USING ("updated_at" AT TIME ZONE 'UTC')`,
    );
  }
}
