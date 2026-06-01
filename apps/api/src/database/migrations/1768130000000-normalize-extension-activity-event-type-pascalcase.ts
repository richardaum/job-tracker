import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Normalize extension_activity_event_type PG enum values from UPPER_SNAKE_CASE to PascalCase.
 *
 * The API TS enum had values like "SOURCE_RUN_STARTED" but the extension codegen
 * generated PascalCase values like "SourceRunStarted" from the GraphQL schema member names.
 * This migration makes the PG enum consistent with PascalCase.
 *
 * Also adds missing values: SourceRunPageCollected, SourceRunStopConditionMet.
 */
export class NormalizeExtensionActivityEventTypePascalCase1768130000000 implements MigrationInterface {
  name = "NormalizeExtensionActivityEventTypePascalCase1768130000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    // Map of old UPPER_SNAKE_CASE values to new PascalCase values
    const renameMap: Record<string, string> = {
      SOURCE_RUN_RECEIVED: "SourceRunReceived",
      SOURCE_RUN_CLAIM_SKIPPED: "SourceRunClaimSkipped",
      SOURCE_RUN_STARTED: "SourceRunStarted",
      SOURCE_RUN_JOB_IMPORTED: "SourceRunJobImported",
      SOURCE_RUN_COMPLETED: "SourceRunCompleted",
      SOURCE_RUN_FAILED: "SourceRunFailed",
      IMPORT_JOB_STARTED: "ImportJobStarted",
      IMPORT_JOB_COMPLETED: "ImportJobCompleted",
      IMPORT_JOB_FAILED: "ImportJobFailed",
      AUTH_REFRESHED: "AuthRefreshed",
      AUTH_FAILED: "AuthFailed",
    };

    // Add missing values that weren't in the original migration
    await queryRunner.query(`ALTER TYPE "extension_activity_event_type" ADD VALUE 'SourceRunPageCollected'`);
    await queryRunner.query(`ALTER TYPE "extension_activity_event_type" ADD VALUE 'SourceRunStopConditionMet'`);

    // For existing values, we rename in PG (which updates existing rows automatically)
    for (const [oldVal, newVal] of Object.entries(renameMap)) {
      await queryRunner.query(`ALTER TYPE "extension_activity_event_type" RENAME VALUE '${oldVal}' TO '${newVal}'`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: rename PascalCase back to UPPER_SNAKE_CASE
    const renameMap: Record<string, string> = {
      SourceRunReceived: "SOURCE_RUN_RECEIVED",
      SourceRunClaimSkipped: "SOURCE_RUN_CLAIM_SKIPPED",
      SourceRunStarted: "SOURCE_RUN_STARTED",
      SourceRunJobImported: "SOURCE_RUN_JOB_IMPORTED",
      SourceRunCompleted: "SOURCE_RUN_COMPLETED",
      SourceRunFailed: "SOURCE_RUN_FAILED",
      ImportJobStarted: "IMPORT_JOB_STARTED",
      ImportJobCompleted: "IMPORT_JOB_COMPLETED",
      ImportJobFailed: "IMPORT_JOB_FAILED",
      AuthRefreshed: "AUTH_REFRESHED",
      AuthFailed: "AUTH_FAILED",
    };

    for (const [oldVal, newVal] of Object.entries(renameMap)) {
      await queryRunner.query(`ALTER TYPE "extension_activity_event_type" RENAME VALUE '${oldVal}' TO '${newVal}'`);
    }

    // Can't remove values from an enum in PG, so these remain as unused members
  }
}
