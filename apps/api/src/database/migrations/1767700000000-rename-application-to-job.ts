import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameApplicationToJob1767700000000 implements MigrationInterface {
  name = "RenameApplicationToJob1767700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Table renames (PostgreSQL auto-renames PKs and table-owned indexes/constraints) ──
    await queryRunner.query(`ALTER TABLE "applications" RENAME TO "jobs"`);
    await queryRunner.query(
      `ALTER TABLE "application_notes" RENAME TO "job_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" RENAME TO "job_stage_events"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" RENAME TO "draft_jobs"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" RENAME TO "match_analysis"`,
    );

    // ── Column renames ──
    await queryRunner.query(
      `ALTER TABLE "jobs" RENAME COLUMN "draft_application_id" TO "draft_job_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_notes" RENAME COLUMN "application_id" TO "job_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" RENAME COLUMN "application_id" TO "job_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_analysis" RENAME COLUMN "application_id" TO "job_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_analysis" RENAME COLUMN "draft_application_id" TO "draft_job_id"`,
    );

    // ── Index renames (safe — skip if table rename already handled them) ──
    await this.safeRenameIndex(
      queryRunner,
      "applications_pkey",
      "jobs_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "idx_applications_source_run",
      "idx_jobs_source_run",
    );
    await this.safeRenameIndex(
      queryRunner,
      "draft_applications_pkey",
      "draft_jobs_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "application_notes_pkey",
      "job_notes_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "application_stage_events_pkey",
      "job_stage_events_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "fit_analysis_pkey",
      "match_analysis_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "uq_fit_analysis_application_id",
      "uq_match_analysis_job_id",
    );
    await this.safeRenameIndex(
      queryRunner,
      "uq_fit_analysis_draft_application_id",
      "uq_match_analysis_draft_job_id",
    );

    // ── Constraint renames (safe) ──
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_applications_company_id",
      "fk_jobs_company_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_applications_draft_application",
      "fk_jobs_draft_job",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_applications_source_run",
      "fk_jobs_source_run",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_applications_user_id",
      "fk_jobs_user_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "draft_jobs",
      "fk_draft_applications_user_id",
      "fk_draft_jobs_user_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "job_notes",
      "fk_an_application_id",
      "fk_jn_job_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "job_stage_events",
      "fk_ase_application_id",
      "fk_jse_job_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_fit_analysis_application_id",
      "fk_ma_job_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_fit_analysis_draft_application_id",
      "fk_ma_draft_job_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_fit_analysis_resume_id",
      "fk_ma_resume_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_fit_analysis_user_id",
      "fk_ma_user_id",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Constraint renames back ──
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_ma_user_id",
      "fk_fit_analysis_user_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_ma_resume_id",
      "fk_fit_analysis_resume_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_ma_draft_job_id",
      "fk_fit_analysis_draft_application_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "match_analysis",
      "fk_ma_job_id",
      "fk_fit_analysis_application_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "job_stage_events",
      "fk_jse_job_id",
      "fk_ase_application_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "job_notes",
      "fk_jn_job_id",
      "fk_an_application_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "draft_jobs",
      "fk_draft_jobs_user_id",
      "fk_draft_applications_user_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_jobs_user_id",
      "fk_applications_user_id",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_jobs_source_run",
      "fk_applications_source_run",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_jobs_draft_job",
      "fk_applications_draft_application",
    );
    await this.safeRenameConstraint(
      queryRunner,
      "jobs",
      "fk_jobs_company_id",
      "fk_applications_company_id",
    );

    // ── Index renames back ──
    await this.safeRenameIndex(
      queryRunner,
      "uq_match_analysis_draft_job_id",
      "uq_fit_analysis_draft_application_id",
    );
    await this.safeRenameIndex(
      queryRunner,
      "uq_match_analysis_job_id",
      "uq_fit_analysis_application_id",
    );
    await this.safeRenameIndex(
      queryRunner,
      "match_analysis_pkey",
      "fit_analysis_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "job_stage_events_pkey",
      "application_stage_events_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "job_notes_pkey",
      "application_notes_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "draft_jobs_pkey",
      "draft_applications_pkey",
    );
    await this.safeRenameIndex(
      queryRunner,
      "idx_jobs_source_run",
      "idx_applications_source_run",
    );
    await this.safeRenameIndex(
      queryRunner,
      "jobs_pkey",
      "applications_pkey",
    );

    // ── Column renames back ──
    await queryRunner.query(
      `ALTER TABLE "match_analysis" RENAME COLUMN "draft_job_id" TO "draft_application_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_analysis" RENAME COLUMN "job_id" TO "application_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" RENAME COLUMN "job_id" TO "application_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_notes" RENAME COLUMN "job_id" TO "application_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" RENAME COLUMN "draft_job_id" TO "draft_application_id"`,
    );

    // ── Table renames back (reverse order) ──
    await queryRunner.query(
      `ALTER TABLE "match_analysis" RENAME TO "fit_analysis"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_jobs" RENAME TO "draft_applications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" RENAME TO "application_stage_events"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_notes" RENAME TO "application_notes"`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" RENAME TO "applications"`);
  }

  private async safeRenameIndex(
    queryRunner: QueryRunner,
    oldName: string,
    newName: string,
  ): Promise<void> {
    const rows: { name: string }[] = await queryRunner.query(
      `SELECT indexname AS name FROM pg_indexes WHERE indexname = $1`,
      [oldName],
    );
    if (rows.length > 0) {
      await queryRunner.query(
        `ALTER INDEX "${oldName}" RENAME TO "${newName}"`,
      );
    }
  }

  private async safeRenameConstraint(
    queryRunner: QueryRunner,
    tableName: string,
    oldName: string,
    newName: string,
  ): Promise<void> {
    const rows: { constraint_name: string }[] = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = $1 AND constraint_name = $2`,
      [tableName, oldName],
    );
    if (rows.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "${tableName}" RENAME CONSTRAINT "${oldName}" TO "${newName}"`,
      );
    }
  }
}
