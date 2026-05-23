import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Draft → Jobs merge migration.
 *
 * **Operational:**
 * - `transaction = false` because PostgreSQL forbids using a newly-added enum label in the same
 *   transaction as `ALTER TYPE ... ADD VALUE`. Requires `migrationsTransactionMode: "each"` in the
 *   DataSource (see `buildDataSourceOptions`): global `"all"` makes TypeORM throw before running.
 *   If `up()` fails mid-way, **repair manually** (inspect partial schema, rerun from a restored
 *   snapshot, or complete steps by hand)—there is no single transactional guarantee for the whole
 *   migration (no atomic rollback path).
 *
 * **`down()` caveats:**
 * - Only orphaned placeholder-backed DRAFT jobs are split back into `draft_jobs`; **jobs that had**
 *   **`draft_job_id` merged in `up` cannot be reconstructed** — `down` still **drops**
 *   **`html_content` / fill / stage** columns for **all** jobs, **destroying migrated HTML/fill/stage**
 *   data for merged rows (there is intentionally no narrower `ALTER` path for merged rows only).
 * - `application_stage` enum value `DRAFT` cannot be cleanly removed without recreating the enum type;
 *   `down()` does **not** remove `DRAFT` — operators restoring pre-merge code must tolerate the extra label
 *   or recreate the enum in a manual maintenance window.
 */

export class IntegrateDraftIntoJobs1767800000000 implements MigrationInterface {
  /**
   * Postgres: enum labels added with `ALTER TYPE ... ADD VALUE` cannot be assigned in the same
   * transaction that adds them ("unsafe use of new value"). Disabling wrapping fixes integration tests and deploys.
   */
  transaction?: boolean = false;

  name = "IntegrateDraftIntoJobs1767800000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "application_stage" ADD VALUE IF NOT EXISTS 'DRAFT'
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
        ADD COLUMN IF NOT EXISTS "html_content" text NULL,
        ADD COLUMN IF NOT EXISTS "fill_status" text NULL,
        ADD COLUMN IF NOT EXISTS "fill_error" text NULL,
        ADD COLUMN IF NOT EXISTS "fill_timestamp" timestamptz NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
        ALTER COLUMN "title" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
        ADD COLUMN IF NOT EXISTS "stage" "application_stage" NOT NULL DEFAULT 'NEW'
    `);

    // Backfill persisted jobs.stage using same latest-event ordering as JobsRepository queries.
    await queryRunner.query(`
      UPDATE "jobs" j
      SET "stage" = ls."to_stage"
      FROM (
        SELECT DISTINCT ON ("job_id")
          "job_id",
          "to_stage"
        FROM "job_stage_events"
        ORDER BY "job_id",
          COALESCE("schedule_at", "created_at") DESC,
          "created_at" DESC,
          "id" DESC
      ) ls
      WHERE j."id" = ls."job_id"
    `);

    await queryRunner.query(`
      UPDATE "jobs" j
      SET
        "html_content" = d."html_content",
        "fill_status" = CASE d."conversion_status"
          WHEN 'PROCESSING' THEN 'PROCESSING'
          WHEN 'SUCCEEDED' THEN 'COMPLETED'
          WHEN 'FAILED' THEN 'FAILED'
          ELSE NULL
        END,
        "fill_error" = d."conversion_error",
        "fill_timestamp" = d."conversion_timestamp",
        "urls" = ARRAY(
          SELECT DISTINCT u
          FROM unnest(
            COALESCE(j."urls", ARRAY[]::text[]) ||
            CASE
              WHEN d."url" IS NOT NULL AND TRIM(d."url") <> '' THEN ARRAY[TRIM(BOTH FROM d."url")]::text[]
              ELSE ARRAY[]::text[]
            END
          ) AS u
          ORDER BY u
        )
      FROM "draft_jobs" d
      WHERE j."draft_job_id" = d."id"
    `);

    await queryRunner.query(
      `
      INSERT INTO "companies" ("id", "user_id", "name", "description", "created_at", "updated_at")
      SELECT DISTINCT ON (d."user_id")
        gen_random_uuid()::text,
        d."user_id",
        $1,
        NULL,
        now(),
        now()
      FROM "draft_jobs" d
      WHERE NOT EXISTS (
          SELECT 1 FROM "jobs" j WHERE j."draft_job_id" = d."id"
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "companies" c
          WHERE c."user_id" = d."user_id"
            AND LOWER(TRIM(c."name")) = LOWER(TRIM($1))
        )
      ORDER BY d."user_id"
    `,
      ["Draft (pending company)"],
    );

    await queryRunner.query(
      `
      INSERT INTO "jobs" (
        "id",
        "user_id",
        "title",
        "company_id",
        "description",
        "urls",
        "source",
        "salary_min_cents",
        "salary_max_cents",
        "salary_currency",
        "salary_period",
        "tags",
        "location",
        "work_region",
        "draft_job_id",
        "summary",
        "summary_status",
        "summary_error",
        "summary_timestamp",
        "source_run_id",
        "html_content",
        "fill_status",
        "fill_error",
        "fill_timestamp",
        "stage",
        "created_at",
        "updated_at"
      )
      SELECT
        d."id",
        d."user_id",
        d."title",
        c."id",
        NULL,
        CASE
          WHEN d."url" IS NOT NULL AND TRIM(d."url") <> '' THEN ARRAY[TRIM(BOTH FROM d."url")]::text[]
          ELSE ARRAY[]::text[]
        END,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        ARRAY[]::text[],
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        d."html_content",
        CASE d."conversion_status"
          WHEN 'PROCESSING' THEN 'PROCESSING'
          WHEN 'SUCCEEDED' THEN 'COMPLETED'
          WHEN 'FAILED' THEN 'FAILED'
          ELSE NULL
        END,
        d."conversion_error",
        d."conversion_timestamp",
        'DRAFT'::"application_stage",
        d."created_at"::timestamp,
        d."updated_at"::timestamp
      FROM "draft_jobs" d
      JOIN "companies" c ON c."user_id" = d."user_id"
        AND LOWER(TRIM(c."name")) = LOWER(TRIM($1))
      WHERE NOT EXISTS (SELECT 1 FROM "jobs" j WHERE j."draft_job_id" = d."id")
        AND NOT EXISTS (SELECT 1 FROM "jobs" j2 WHERE j2."id" = d."id")
    `,
      ["Draft (pending company)"],
    );

    await queryRunner.query(`
      INSERT INTO "job_stage_events" (
        "id",
        "job_id",
        "user_id",
        "from_stage",
        "to_stage",
        "source",
        "reason",
        "schedule_at",
        "created_at"
      )
      SELECT
        gen_random_uuid()::text,
        j."id",
        j."user_id",
        NULL,
        'DRAFT'::"application_stage",
        'System'::"stage_event_source",
        NULL,
        NULL,
        j."created_at"::timestamptz
      FROM "jobs" j
      WHERE j."stage" = 'DRAFT'::"application_stage"
        AND NOT EXISTS (
          SELECT 1 FROM "job_stage_events" e WHERE e."job_id" = j."id"
        )
    `);

    await queryRunner.query(`
      UPDATE "match_analysis" ma
      SET "job_id" = j."id"
      FROM "jobs" j
      WHERE ma."draft_job_id" IS NOT NULL
        AND ma."draft_job_id" = j."draft_job_id"
        AND ma."job_id" IS DISTINCT FROM j."id"
    `);

    await queryRunner.query(`
      UPDATE "match_analysis" ma
      SET "job_id" = ma."draft_job_id"
      WHERE ma."draft_job_id" IS NOT NULL
        AND ma."job_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis" DROP CONSTRAINT IF EXISTS "fk_ma_draft_job_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis" DROP CONSTRAINT IF EXISTS "uq_match_analysis_draft_job_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis" DROP COLUMN IF EXISTS "draft_job_id"
    `);

    await queryRunner.query(`
      -- Orphan analyses: unmigrated rows still have job_id IS NULL once draft_job_id is dropped.
      -- DELETE (+ WARNING with row count) so SET NOT NULL cannot fail on legacy NULLs.
      DO $purge$
      DECLARE
        deleted_count integer;
      BEGIN
        DELETE FROM "match_analysis" WHERE "job_id" IS NULL;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        IF deleted_count > 0 THEN
          RAISE WARNING 'IntegrateDraftIntoJobs: deleted % orphan match_analysis row(s) (NULL job_id after repoint); review backups if unexpected',
            deleted_count;
        END IF;
      END;
      $purge$
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis"
        ALTER COLUMN "job_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "fk_jobs_draft_job"
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs" DROP COLUMN IF EXISTS "draft_job_id"
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "draft_jobs"`);
  }

  /**
   * @danger — best-effort rewind only:
   * - Recreates `draft_jobs` **only** for placeholder-company rows and rewires orphan analyses.
   * - Immediately after, **drops** `jobs.html_content`, `fill_*`, and `jobs.stage` for **every**
   *   job — merged real applications **lose captured HTML/fill/state** irrevocably; this is NOT a
   *   full inverse of `up`. Prefer restore-from-backup over `down` for production merges.
   */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "match_analysis"
        ALTER COLUMN "job_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "draft_jobs" (
        "id" text PRIMARY KEY NOT NULL,
        "url" text,
        "title" text NOT NULL DEFAULT '',
        "user_id" text NOT NULL,
        "html_content" text NOT NULL,
        "conversion_status" text,
        "conversion_error" text,
        "conversion_timestamp" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_draft_jobs_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis"
        ADD COLUMN "draft_job_id" text NULL
    `);

    await queryRunner.query(
      `
      INSERT INTO "draft_jobs" (
        "id",
        "url",
        "title",
        "user_id",
        "html_content",
        "conversion_status",
        "conversion_error",
        "conversion_timestamp",
        "created_at",
        "updated_at"
      )
      SELECT
        j."id",
        CASE
          WHEN j."urls" IS NOT NULL AND CARDINALITY(j."urls") > 0 THEN j."urls"[1]
          ELSE NULL
        END,
        COALESCE(NULLIF(trim(j."title"), ''), '') AS "_title",
        j."user_id",
        CASE
          WHEN j."html_content" IS NULL OR trim(j."html_content") = '' THEN ' '
          ELSE j."html_content"
        END,
        CASE j."fill_status"
          WHEN 'PROCESSING' THEN 'PROCESSING'
          WHEN 'COMPLETED' THEN 'SUCCEEDED'
          WHEN 'FAILED' THEN 'FAILED'
          ELSE NULL
        END,
        j."fill_error",
        j."fill_timestamp",
        j."created_at"::timestamptz,
        j."updated_at"::timestamptz
      FROM "jobs" j
      INNER JOIN "companies" c ON c."id" = j."company_id"
      WHERE j."stage" = 'DRAFT'::"application_stage"
        AND LOWER(TRIM(c."name")) = LOWER(TRIM($1))
      `,
      ["Draft (pending company)"],
    );

    await queryRunner.query(
      `
      UPDATE "match_analysis" ma
      SET
        "draft_job_id" = ma."job_id",
        "job_id" = NULL
      WHERE ma."job_id" IN (
        SELECT j."id"
        FROM "jobs" j
        INNER JOIN "companies" c ON c."id" = j."company_id"
        WHERE j."stage" = 'DRAFT'::"application_stage"
          AND LOWER(TRIM(c."name")) = LOWER(TRIM($1))
      )
      `,
      ["Draft (pending company)"],
    );

    await queryRunner.query(
      `
      DELETE FROM "jobs"
      WHERE "stage" = 'DRAFT'::"application_stage"
        AND EXISTS (
          SELECT 1 FROM "companies" c
          WHERE c."id" = "jobs"."company_id"
            AND LOWER(TRIM(c."name")) = LOWER(TRIM($1))
        )
      `,
      ["Draft (pending company)"],
    );

    await queryRunner.query(
      `
      DELETE FROM "companies" c
      WHERE LOWER(TRIM(c."name")) = LOWER(TRIM($1))
        AND NOT EXISTS (
          SELECT 1 FROM "jobs" j WHERE j."company_id" = c."id"
        )
      `,
      ["Draft (pending company)"],
    );

    // ⚠ Deletes merged draft→job enrichment for ALL rows (see class-level `down()` warning).
    await queryRunner.query(`
      ALTER TABLE "jobs" DROP COLUMN IF EXISTS "html_content"
    `);
    await queryRunner.query(`
      ALTER TABLE "jobs" DROP COLUMN IF EXISTS "fill_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "jobs" DROP COLUMN IF EXISTS "fill_error"
    `);
    await queryRunner.query(`
      ALTER TABLE "jobs" DROP COLUMN IF EXISTS "fill_timestamp"
    `);
    await queryRunner.query(`
      ALTER TABLE "jobs" DROP COLUMN IF EXISTS "stage"
    `);

    await queryRunner.query(`
      UPDATE "jobs"
      SET "title" = COALESCE(NULLIF(trim("title"), ''), '')
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
        ADD COLUMN "draft_job_id" text NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
        ADD CONSTRAINT "fk_jobs_draft_job" FOREIGN KEY ("draft_job_id")
          REFERENCES "draft_jobs" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis"
        ADD CONSTRAINT "uq_match_analysis_draft_job_id" UNIQUE ("draft_job_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "match_analysis"
        ADD CONSTRAINT "fk_ma_draft_job_id" FOREIGN KEY ("draft_job_id")
          REFERENCES "draft_jobs" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs"
        ALTER COLUMN "title" SET NOT NULL
    `);
  }
}
