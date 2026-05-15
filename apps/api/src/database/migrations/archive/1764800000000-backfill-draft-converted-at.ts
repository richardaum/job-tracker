import type { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillDraftConvertedAt1764800000000 implements MigrationInterface {
  name = "BackfillDraftConvertedAt1764800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Set converted_at to the earliest "applied" stage event for linked apps
    await queryRunner.query(`
      UPDATE "draft_applications" d
      SET "converted_at" = (
        SELECT MIN(ase.created_at)
        FROM "applications" a
        JOIN "application_stage_events" ase ON ase.application_id = a.id
        WHERE a.draft_application_id = d.id
          AND ase.to_stage = 'applied'
      )
      WHERE d.conversion_status = 'succeeded'
        AND d.converted_at IS NULL
        AND EXISTS (
          SELECT 1 FROM "applications" a WHERE a.draft_application_id = d.id
        );
    `);

    // 2. Fallback: use created_at for remaining converted drafts
    await queryRunner.query(`
      UPDATE "draft_applications"
      SET "converted_at" = "created_at"
      WHERE conversion_status = 'succeeded'
        AND "converted_at" IS NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No undo — setting converted_at back to NULL would lose data.
    // The value was derived, not user-provided.
  }
}
