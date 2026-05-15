import { randomUUID } from "node:crypto";

import { isTipTapDocumentString, plainTextToTipTap } from "@job-tracker/tiptap";
import type { MigrationInterface, QueryRunner } from "typeorm";
const REMOTEYEAH_SURFACE_URL =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide";

export class SquashedBaseline1767000000000 implements MigrationInterface {
  name = "SquashedBaseline1767000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === 1746009600000-baseline.ts ===
    await queryRunner.query(`CREATE TYPE "public"."role" AS ENUM('user')`);
    await queryRunner.query(
      `CREATE TYPE "public"."salary_period" AS ENUM('year', 'month', 'hour')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."application_stage" AS ENUM('new', 'applied', 'recruiter_screen', 'technical', 'offer', 'rejected')`,
    );
    await queryRunner.query(`CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
)`);
    await queryRunner.query(`CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"description" text,
	"url" text,
	"salary_min_cents" integer,
	"salary_max_cents" integer,
	"salary_currency" text,
	"salary_period" "salary_period",
	"salary_tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
)`);
    await queryRunner.query(`CREATE TABLE "application_stage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"user_id" text NOT NULL,
	"from_stage" "application_stage",
	"to_stage" "application_stage" NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"schedule_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
)`);
    await queryRunner.query(`CREATE TABLE "application_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
)`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD CONSTRAINT "application_stage_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD CONSTRAINT "application_stage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // === 1747000000000-add-application-salary-columns.ts ===
    await queryRunner.query(`
DO $$ BEGIN
  CREATE TYPE "public"."salary_period" AS ENUM('year', 'month', 'hour');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_min_cents" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_max_cents" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_currency" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_period" "public"."salary_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_tags" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );

    // === 1748000000000-rename-salary-tags-to-tags.ts ===
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(
      `UPDATE "applications" SET "tags" = "salary_tags" WHERE "salary_tags" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_tags"`,
    );

    // === 1749000000000-create-companies.ts ===
    // 1. Create companies table
    await queryRunner.query(`CREATE TABLE "companies" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
)`);

    // 2. Add foreign key to users
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // 3. Add company_id to applications (initially nullable)
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "company_id" text`,
    );

    // 4. Migrate existing data
    const applications = await queryRunner.query(
      `SELECT id, user_id, company FROM "applications"`,
    );

    // We want to create unique companies per user/name
    const companiesMap = new Map<string, string>(); // "userId:companyName" -> companyId

    for (const app of applications) {
      const key = `${app.user_id}:${app.company}`;
      let companyId = companiesMap.get(key);

      if (!companyId) {
        companyId = randomUUID();
        await queryRunner.query(
          `INSERT INTO "companies" (id, user_id, name, created_at, updated_at) VALUES ($1, $2, $3, now(), now())`,
          [companyId, app.user_id, app.company],
        );
        companiesMap.set(key, companyId);
      }

      await queryRunner.query(
        `UPDATE "applications" SET company_id = $1 WHERE id = $2`,
        [companyId, app.id],
      );
    }

    // 5. Make company_id NOT NULL and add foreign key
    await queryRunner.query(
      `ALTER TABLE "applications" ALTER COLUMN "company_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // 6. Drop old company column
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "company"`);

    // === 1750000000000-ensure-company-description-tiptap.ts ===
    const companies = await queryRunner.query(
      `SELECT id, description FROM "companies" WHERE description IS NOT NULL`,
    );

    for (const company of companies) {
      const { id, description } = company;

      if (!isTipTapDocumentString(description)) {
        const tiptapDoc = plainTextToTipTap(description);
        await queryRunner.query(
          `UPDATE "companies" SET description = $1 WHERE id = $2`,
          [tiptapDoc, id],
        );
      }
    }

    // === 1751000000000-add-stage-event-reason.ts ===
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD COLUMN IF NOT EXISTS "reason" text`,
    );

    // === 1752000000000-use-timestamptz-for-stage-events.ts ===
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

    // === 1753000000000-add-application-source.ts ===
    await queryRunner.query(`
DO $$ BEGIN
  CREATE TYPE "public"."application_source" AS ENUM('Linkedin', 'Jack', 'Wellfound');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "source" "public"."application_source"`,
    );
    await queryRunner.query(`
UPDATE "applications"
SET "source" = CASE
  WHEN "url" IS NULL OR "url" = '' THEN NULL
  WHEN "url" ILIKE '%linkedin%' THEN 'Linkedin'::"public"."application_source"
  WHEN "url" ILIKE '%jack%' THEN 'Jack'::"public"."application_source"
  WHEN "url" ILIKE '%wellfound%' THEN 'Wellfound'::"public"."application_source"
  ELSE NULL
END
WHERE "source" IS NULL;
`);

    // === 1754000000000-companies-user-lower-name-unique.ts ===
    const groupsWithDuplicates = (await queryRunner.query(
      `
  SELECT user_id AS "user_id", LOWER(TRIM(name)) AS "name_key"
  FROM companies
  GROUP BY user_id, LOWER(TRIM(name))
  HAVING COUNT(*) > 1
`,
    )) as Array<{ user_id: string; name_key: string }>;

    for (const g of groupsWithDuplicates) {
      const rows = (await queryRunner.query(
        `
    SELECT id FROM companies
    WHERE user_id = $1 AND LOWER(TRIM(name)) = $2
    ORDER BY created_at ASC, id ASC
  `,
        [g.user_id, g.name_key],
      )) as Array<{ id: string }>;

      if (rows.length < 2) {
        continue;
      }

      const canonicalId = rows[0]?.id;
      if (!canonicalId) {
        continue;
      }

      for (let i = 1; i < rows.length; i++) {
        const orphanId = rows[i]?.id;
        if (!orphanId || orphanId === canonicalId) {
          continue;
        }
        await queryRunner.query(
          `UPDATE applications SET company_id = $1 WHERE company_id = $2`,
          [canonicalId, orphanId],
        );
        await queryRunner.query(`DELETE FROM companies WHERE id = $1`, [
          orphanId,
        ]);
      }
    }

    await queryRunner.query(`
  CREATE UNIQUE INDEX "UQ_companies_user_lower_name"
  ON "companies" ("user_id", (LOWER(TRIM("name"))))
`);

    // === 1755000000000-create-import-runs.ts ===
    await queryRunner.query(`
DO $$ BEGIN
  CREATE TYPE "public"."import_run_status" AS ENUM('running', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`);
    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS "import_runs" (
  "id" text NOT NULL,
  "user_id" text NOT NULL,
  "importer_id" text NOT NULL,
  "importer_name" text NOT NULL,
  "entry_url" text NOT NULL,
  "status" "public"."import_run_status" NOT NULL DEFAULT 'running',
  "started_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "PK_import_runs" PRIMARY KEY ("id")
);
`);
    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS "IDX_import_runs_user_started"
  ON "import_runs" ("user_id", "started_at" DESC);
`);

    // === 1755100000000-import-run-status-in-progress.ts ===
    await queryRunner.query(`
ALTER TYPE "public"."import_run_status" ADD VALUE IF NOT EXISTS 'in_progress';
`);

    // === 1755200000000-drop-import-runs-executor-plan-json.ts ===
    await queryRunner.query(`
  ALTER TABLE "import_runs"
  DROP COLUMN IF EXISTS "executor_plan_json";
`);

    // === 1756000000000-add-application-urls.ts ===
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "urls" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(`
UPDATE "applications"
SET "urls" = ARRAY["url"]::text[]
WHERE cardinality("urls") = 0
  AND "url" IS NOT NULL
  AND btrim("url") <> '';
`);

    // === 1756000001000-drop-application-url.ts ===
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN IF EXISTS "url"`,
    );

    // === 1757000000000-create-exchange-rate-cache.ts ===
    await queryRunner.query(`
  CREATE TABLE IF NOT EXISTS exchange_rate_cache (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    base_currency text NOT NULL,
    rates_json jsonb NOT NULL,
    ttl_seconds integer NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_exchange_rate_cache PRIMARY KEY (id),
    CONSTRAINT uq_exchange_rate_base_currency UNIQUE (base_currency)
  )
`);
    await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS idx_exchange_rate_base_currency
  ON exchange_rate_cache (base_currency)
`);

    // === 1758000000000-create-draft-applications.ts ===
    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS "draft_applications" (
  "id" text NOT NULL,
  "url" text NOT NULL,
  "html_content" text NOT NULL,
  CONSTRAINT "PK_draft_applications" PRIMARY KEY ("id")
);
`);

    // === 1762440000000-add-title-to-draft-applications.ts ===
    await queryRunner.query(`
ALTER TABLE "draft_applications"
ADD COLUMN IF NOT EXISTS "title" text NOT NULL DEFAULT '';
`);

    // === 1763000000000-draft-ai-generated-fields-and-application-link.ts ===
    await queryRunner.query(`
  ALTER TABLE "applications"
  ADD COLUMN IF NOT EXISTS "draft_application_id" text NULL;
`);
    await queryRunner.query(`
  ALTER TABLE "applications"
  ADD CONSTRAINT "FK_applications_draft_application"
  FOREIGN KEY ("draft_application_id") REFERENCES "draft_applications"("id")
  ON DELETE SET NULL;
`);

    // === 1763000000001-drop-draft-applications-ai-generated-fields.ts ===
    await queryRunner.query(`
  ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "ai_generated_fields";
`);

    // === 1763200000000-add-draft-application-conversion-status.ts ===
    await queryRunner.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'draft_application_conversion_status'
    ) THEN
      CREATE TYPE "draft_application_conversion_status" AS ENUM (
        'idle',
        'processing',
        'succeeded',
        'failed'
      );
    END IF;
  END
  $$;
`);

    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD COLUMN IF NOT EXISTS "conversion_status" "draft_application_conversion_status" NOT NULL DEFAULT 'idle';
`);
    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD COLUMN IF NOT EXISTS "conversion_error" text NULL;
`);

    // === 1763300000000-add-application-stage-duplicated.ts ===
    await queryRunner.query(`
ALTER TYPE "public"."application_stage" ADD VALUE IF NOT EXISTS 'duplicated';
`);

    // === 1763300001000-add-application-stage-cultural-fit.ts ===
    await queryRunner.query(`
ALTER TYPE "public"."application_stage" ADD VALUE IF NOT EXISTS 'cultural_fit';
`);

    // === 1763400000000-add-application-source-remoteyeah.ts ===
    await queryRunner.query(`
ALTER TYPE "public"."application_source" ADD VALUE IF NOT EXISTS 'RemoteYeah';
`);

    // === 1763400000001-backfill-application-source-remoteyeah.ts ===
    await queryRunner.query(`
UPDATE "applications"
SET "source" = 'RemoteYeah'::"public"."application_source"
WHERE "source" IS NULL
  AND EXISTS (
SELECT 1
FROM unnest("urls") AS u
WHERE lower(u) LIKE '%remoteyeah%'
  );
`);

    // === 1763500000000-drop-import-runs-entry-url.ts ===
    await queryRunner.query(
      `ALTER TABLE "import_runs" DROP COLUMN "entry_url"`,
    );

    // === 1763600000000-drop-import-runs-importer-name.ts ===
    await queryRunner.query(
      `ALTER TABLE "import_runs" DROP COLUMN "importer_name"`,
    );

    // === 1763700000000-move-draft-application-fk-to-draft-table.ts ===
    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD COLUMN IF NOT EXISTS "application_id" text NULL;
`);

    await queryRunner.query(`
  UPDATE "draft_applications" AS d
  SET application_id = picked.app_id
  FROM (
    SELECT DISTINCT ON (a."draft_application_id")
      a."draft_application_id" AS draft_id,
      a.id AS app_id
    FROM "applications" a
    WHERE a."draft_application_id" IS NOT NULL
    ORDER BY a."draft_application_id", a."created_at" DESC
  ) AS picked
  WHERE d.id = picked.draft_id;
`);

    await queryRunner.query(`
  ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_draft_application";
`);
    await queryRunner.query(`
  ALTER TABLE "applications" DROP COLUMN IF EXISTS "draft_application_id";
`);

    await queryRunner.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS "UQ_draft_applications_application_id"
  ON "draft_applications" ("application_id")
  WHERE "application_id" IS NOT NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD CONSTRAINT "FK_draft_applications_application"
  FOREIGN KEY ("application_id") REFERENCES "applications"("id")
  ON DELETE SET NULL;
`);

    // === 1763800000000-applications-draft-many-to-one.ts ===
    await queryRunner.query(`
  ALTER TABLE "applications"
  ADD COLUMN IF NOT EXISTS "draft_application_id" text NULL;
`);

    await queryRunner.query(`
  UPDATE "applications" AS a
  SET "draft_application_id" = d.id
  FROM "draft_applications" d
  WHERE d."application_id" IS NOT NULL
    AND d."application_id" = a.id;
`);

    await queryRunner.query(`
  ALTER TABLE "draft_applications" DROP CONSTRAINT IF EXISTS "FK_draft_applications_application";
`);
    await queryRunner.query(`
  DROP INDEX IF EXISTS "UQ_draft_applications_application_id";
`);
    await queryRunner.query(`
  ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "application_id";
`);

    await queryRunner.query(`
  ALTER TABLE "applications"
  ADD CONSTRAINT "FK_applications_draft_application"
  FOREIGN KEY ("draft_application_id") REFERENCES "draft_applications"("id")
  ON DELETE SET NULL;
`);

    // === 1763900000000-import-templates-and-run-surface-url.ts ===
    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS "import_templates" (
  "id" text NOT NULL,
  "user_id" text NOT NULL,
  "importer_id" text NOT NULL,
  "schedule_cron" text,
  "schedule_enabled" boolean NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "PK_import_templates" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_import_templates_user_importer" UNIQUE ("user_id", "importer_id")
);
`);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS "IDX_import_templates_user"
  ON "import_templates" ("user_id");
`);

    await queryRunner.query(`
INSERT INTO "import_templates" ("id", "user_id", "importer_id", "schedule_enabled", "created_at")
SELECT gen_random_uuid()::text, "user_id", "importer_id", false, now()
FROM (SELECT DISTINCT "user_id", "importer_id" FROM "import_runs") AS d;
`);

    await queryRunner.query(`
ALTER TABLE "import_runs" ADD COLUMN IF NOT EXISTS "template_id" text;
`);
    await queryRunner.query(`
ALTER TABLE "import_runs" ADD COLUMN IF NOT EXISTS "surface_url" text;
`);

    await queryRunner.query(`
UPDATE "import_runs" r
SET "template_id" = t."id"
FROM "import_templates" t
WHERE r."user_id" = t."user_id" AND r."importer_id" = t."importer_id";
`);

    await queryRunner.query(
      `
UPDATE "import_runs"
SET "surface_url" = $1
WHERE "importer_id" = 'remoteyeah' AND "surface_url" IS NULL;
`,
      [REMOTEYEAH_SURFACE_URL],
    );

    await queryRunner.query(`
ALTER TABLE "import_runs" ALTER COLUMN "template_id" SET NOT NULL;
`);

    await queryRunner.query(`
ALTER TABLE "import_runs" DROP CONSTRAINT IF EXISTS "FK_import_runs_template";
`);
    await queryRunner.query(`
ALTER TABLE "import_runs" ADD CONSTRAINT "FK_import_runs_template"
  FOREIGN KEY ("template_id") REFERENCES "import_templates"("id") ON DELETE CASCADE;
`);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS "IDX_import_runs_template_started"
  ON "import_runs" ("template_id", "started_at" DESC);
`);

    await queryRunner.query(`
ALTER TABLE "import_runs" DROP COLUMN "importer_id";
`);

    await queryRunner.query(`
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "import_run_id" text;
`);

    await queryRunner.query(`
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_import_run";
`);
    await queryRunner.query(`
ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_import_run"
  FOREIGN KEY ("import_run_id") REFERENCES "import_runs"("id") ON DELETE SET NULL;
`);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS "IDX_applications_import_run"
  ON "applications" ("import_run_id")
  WHERE "import_run_id" IS NOT NULL;
`);

    // === 1763910000000-import-template-default-surface-url.ts ===
    await queryRunner.query(`
ALTER TABLE "import_templates" ADD COLUMN IF NOT EXISTS "surface_url" text;
`);

    // === 1764000000000-make-surface-url-mandatory.ts ===
    // Fill any null surface_url with a placeholder
    await queryRunner.query(`
  UPDATE "import_templates"
  SET "surface_url" = 'https://example.com'
  WHERE "surface_url" IS NULL;
`);

    await queryRunner.query(`
  UPDATE "import_runs"
  SET "surface_url" = 'https://example.com'
  WHERE "surface_url" IS NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "import_templates" ALTER COLUMN "surface_url" SET NOT NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "import_runs" ALTER COLUMN "surface_url" SET NOT NULL;
`);

    // === 1764100000000-create-resumes.ts ===
    await queryRunner.query(`CREATE TABLE "resumes" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
)`);

    await queryRunner.query(
      `ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // === 1764200000000-create-user-preferences.ts ===
    await queryRunner.query(`CREATE TABLE "user_preferences" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "items" jsonb DEFAULT '[]' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
)`);

    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "uq_user_preferences_user_id" UNIQUE ("user_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // === 1764300000000-make-draft-application-url-nullable.ts ===
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ALTER COLUMN "url" DROP NOT NULL`,
    );

    // === 1764400000000-create-fit-analysis.ts ===
    await queryRunner.query(`CREATE TABLE "fit_analysis" (
  "id" text PRIMARY KEY NOT NULL,
  "application_id" text NOT NULL,
  "resume_id" text NOT NULL,
  "score_ratio" double precision,
  "classification" text,
  "fit_count" integer DEFAULT 0 NOT NULL,
  "gap_count" integer DEFAULT 0 NOT NULL,
  "unclear_count" integer DEFAULT 0 NOT NULL,
  "items" jsonb DEFAULT '[]' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
)`);

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fit_analysis_application_id_unique" UNIQUE ("application_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fit_analysis_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action`,
    );

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fit_analysis_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // === 1764500000000-add-fit-analysis-status.ts ===
    await queryRunner.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'fit_analysis_status'
    ) THEN
      CREATE TYPE "fit_analysis_status" AS ENUM (
        'processing',
        'completed',
        'failed'
      );
    END IF;
  END
  $$;
`);

    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD COLUMN IF NOT EXISTS "status" "fit_analysis_status" NOT NULL DEFAULT 'completed';
`);
    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD COLUMN IF NOT EXISTS "error" text NULL;
`);

    // === 1764600000000-add-resume-is-default.ts ===
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD COLUMN "is_default" boolean NOT NULL DEFAULT false`,
    );

    // === 1764700000000-add-draft-converted-at.ts ===
    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD COLUMN IF NOT EXISTS "converted_at" timestamp NULL;
`);

    // === 1764800000000-backfill-draft-converted-at.ts ===
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

    // === 1764900000000-add-fit-draft-support.ts ===
    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ALTER COLUMN "application_id" DROP NOT NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD COLUMN IF NOT EXISTS "draft_application_id" text NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD CONSTRAINT "fit_analysis_draft_application_id_unique" UNIQUE ("draft_application_id");
`);

    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD CONSTRAINT "fit_analysis_draft_application_id_draft_applications_id_fk"
  FOREIGN KEY ("draft_application_id")
  REFERENCES "public"."draft_applications"("id")
  ON DELETE cascade ON UPDATE no action;
`);

    // === 1765000000000-add-fit-analysis-user-id.ts ===
    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD COLUMN IF NOT EXISTS "user_id" text NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "fit_analysis"
  ADD CONSTRAINT "fit_analysis_user_id_users_id_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
`);

    // === 1765100000000-add-draft-user-id.ts ===
    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD COLUMN IF NOT EXISTS "user_id" text NULL;
`);

    await queryRunner.query(`
  ALTER TABLE "draft_applications"
  ADD CONSTRAINT "draft_applications_user_id_users_id_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
`);

    // === 1765200000000-use-timestamptz-for-drafts-and-resumes.ts ===
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

    // === 1765400000000-rename-import-to-source.ts ===
    // 1. Drop FK + index on applications before table rename
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_import_run"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_applications_import_run"`,
    );

    // 2. Rename enum (may already be renamed from a partial run)
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TYPE "public"."import_run_status" RENAME TO "source_run_status";
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;
`);

    // 3. Rename column on applications
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "applications" RENAME COLUMN "import_run_id" TO "source_run_id";
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END $$;
`);

    // 4. Rename tables
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "import_runs" RENAME TO "source_runs";
  EXCEPTION
    WHEN duplicate_table THEN NULL;
  END $$;
`);
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "import_templates" RENAME TO "source_templates";
  EXCEPTION
    WHEN duplicate_table THEN NULL;
  END $$;
`);

    // 5. Rename columns within renamed tables
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "source_templates" RENAME COLUMN "importer_id" TO "source_profile_id";
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END $$;
`);

    // 6. Rename constraints
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "source_runs" RENAME CONSTRAINT "PK_import_runs" TO "PK_source_runs";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END $$;
`);
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "source_templates" RENAME CONSTRAINT "PK_import_templates" TO "PK_source_templates";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END $$;
`);
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "source_templates" RENAME CONSTRAINT "UQ_import_templates_user_importer" TO "UQ_source_templates_user_source_profile";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END $$;
`);

    // 7. Rename indexes (check existence via pg_class first)
    await queryRunner.query(`
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'IDX_import_runs_user_started') THEN
      ALTER INDEX "IDX_import_runs_user_started" RENAME TO "IDX_source_runs_user_started";
    END IF;
  END $$;
`);
    await queryRunner.query(`
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'IDX_import_runs_template_started') THEN
      ALTER INDEX "IDX_import_runs_template_started" RENAME TO "IDX_source_runs_template_started";
    END IF;
  END $$;
`);
    await queryRunner.query(`
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'IDX_import_templates_user') THEN
      ALTER INDEX "IDX_import_templates_user" RENAME TO "IDX_source_templates_user";
    END IF;
  END $$;
`);

    // 8. Re-create FK and index on applications
    await queryRunner.query(`
  DO $$ BEGIN
    ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_source_run" FOREIGN KEY ("source_run_id") REFERENCES "source_runs"("id") ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;
`);
    await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS "IDX_applications_source_run" ON "applications" ("source_run_id")
`);

    // === 1765500000000-add-application-location-fields.ts ===
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "location" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "work_region" text NULL`,
    );

    // === 1766000000000-add-application-summary-fields.ts ===
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_status" text NOT NULL DEFAULT 'completed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_error" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_generated_at" timestamp NULL`,
    );

    // === 1766100000000-add-summary-generated-at.ts ===
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_generated_at" timestamp NULL`,
    );

    // === 1766200000000-fix-summary-status-case.ts ===
    await queryRunner.query(
      `UPDATE "applications" SET "summary_status" = 'COMPLETED' WHERE "summary_status" = 'completed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ALTER COLUMN "summary_status" SET DEFAULT 'COMPLETED'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty: squashed baseline migration is not reversible.
  }
}
