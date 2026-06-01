import type { MigrationInterface, QueryRunner } from "typeorm";

export class SquashedBaseline1767000000000 implements MigrationInterface {
  name = "SquashedBaseline1767000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ──────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "role" AS ENUM('user')`);
    await queryRunner.query(`CREATE TYPE "salary_period" AS ENUM('year', 'month', 'hour')`);
    await queryRunner.query(
      `CREATE TYPE "application_stage" AS ENUM('new', 'applied', 'recruiter_screen', 'technical', 'cultural_fit', 'offer', 'rejected', 'duplicated')`,
    );
    await queryRunner.query(`CREATE TYPE "application_source" AS ENUM('Linkedin', 'Jack', 'Wellfound', 'RemoteYeah')`);
    await queryRunner.query(`CREATE TYPE "source_run_status" AS ENUM('running', 'in_progress', 'completed', 'failed')`);
    await queryRunner.query(
      `CREATE TYPE "draft_application_conversion_status" AS ENUM('idle', 'processing', 'succeeded', 'failed')`,
    );
    await queryRunner.query(`CREATE TYPE "fit_analysis_status" AS ENUM('processing', 'completed', 'failed')`);

    // ── users ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         text PRIMARY KEY NOT NULL,
        "google_id"  text NOT NULL,
        "email"      text NOT NULL,
        "name"       text NOT NULL,
        "avatar_url" text,
        "role"       "role" NOT NULL DEFAULT 'user',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "uq_users_google_id" UNIQUE ("google_id"),
        CONSTRAINT "uq_users_email"     UNIQUE ("email")
      )
    `);

    // ── companies ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id"          text PRIMARY KEY NOT NULL,
        "user_id"     text NOT NULL,
        "name"        text NOT NULL,
        "description" text,
        "created_at"  timestamp NOT NULL DEFAULT now(),
        "updated_at"  timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "fk_companies_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_companies_user_lower_name"
      ON "companies" ("user_id", LOWER(TRIM("name")))
    `);

    // ── applications ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id"                    text PRIMARY KEY NOT NULL,
        "user_id"               text NOT NULL,
        "title"                 text NOT NULL,
        "company_id"            text NOT NULL,
        "description"           text,
        "urls"                  text[] NOT NULL DEFAULT ARRAY[]::text[],
        "source"                "application_source",
        "salary_min_cents"      integer,
        "salary_max_cents"      integer,
        "salary_currency"       text,
        "salary_period"         "salary_period",
        "tags"                  text[] NOT NULL DEFAULT ARRAY[]::text[],
        "location"              text,
        "work_region"           text,
        "draft_application_id"  text,
        "summary"               text,
        "summary_status"        text NOT NULL DEFAULT 'COMPLETED',
        "summary_error"         text,
        "summary_generated_at"  timestamp,
        "source_run_id"         text,
        "created_at"            timestamp NOT NULL DEFAULT now(),
        "updated_at"            timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "fk_applications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "fk_applications_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE`,
    );

    // ── application_stage_events ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "application_stage_events" (
        "id"               text PRIMARY KEY NOT NULL,
        "application_id"   text NOT NULL,
        "user_id"          text NOT NULL,
        "from_stage"       "application_stage",
        "to_stage"         "application_stage" NOT NULL,
        "source"           text NOT NULL DEFAULT 'manual',
        "reason"           text,
        "schedule_at"      timestamptz,
        "created_at"       timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD CONSTRAINT "fk_ase_application_id" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD CONSTRAINT "fk_ase_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // ── application_notes ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "application_notes" (
        "id"               text PRIMARY KEY NOT NULL,
        "application_id"   text NOT NULL,
        "user_id"          text NOT NULL,
        "content"          text NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}',
        "revision"         integer NOT NULL DEFAULT 1,
        "created_at"       timestamp NOT NULL DEFAULT now(),
        "updated_at"       timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "application_notes" ADD CONSTRAINT "fk_an_application_id" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_notes" ADD CONSTRAINT "fk_an_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // ── exchange_rate ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "exchange_rate" (
        "id"              uuid NOT NULL DEFAULT gen_random_uuid(),
        "base_currency"   text NOT NULL,
        "rates_json"      jsonb NOT NULL,
        "ttl_seconds"     integer NOT NULL,
        "expires_at"      timestamptz NOT NULL,
        "created_at"      timestamptz NOT NULL DEFAULT now(),
        "updated_at"      timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_exchange_rate" PRIMARY KEY ("id"),
        CONSTRAINT "uq_exchange_rate_base_currency" UNIQUE ("base_currency")
      )
    `);

    // ── draft_applications ─────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "draft_applications" (
        "id"                text PRIMARY KEY NOT NULL,
        "url"               text,
        "title"             text NOT NULL DEFAULT '',
        "user_id"           text,
        "html_content"      text NOT NULL,
        "conversion_status" "draft_application_conversion_status" NOT NULL DEFAULT 'idle',
        "conversion_error"  text,
        "converted_at"      timestamptz,
        "created_at"        timestamptz NOT NULL DEFAULT now(),
        "updated_at"        timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD CONSTRAINT "fk_draft_applications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // ── source_templates ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "source_templates" (
        "id"                text PRIMARY KEY NOT NULL,
        "user_id"           text NOT NULL,
        "source_profile_id" text NOT NULL,
        "schedule_cron"     text,
        "schedule_enabled"  boolean NOT NULL DEFAULT false,
        "surface_url"       text NOT NULL,
        "created_at"        timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_source_templates_user_source_profile" UNIQUE ("user_id", "source_profile_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_source_templates_user" ON "source_templates" ("user_id")
    `);

    // ── source_runs ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "source_runs" (
        "id"          text PRIMARY KEY NOT NULL,
        "user_id"     text NOT NULL,
        "template_id" text NOT NULL,
        "surface_url" text NOT NULL,
        "status"      "source_run_status" NOT NULL DEFAULT 'running',
        "started_at"  timestamptz NOT NULL
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "source_runs" ADD CONSTRAINT "fk_source_runs_template_id" FOREIGN KEY ("template_id") REFERENCES "source_templates"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`
      CREATE INDEX "idx_source_runs_user_started"
      ON "source_runs" ("user_id", "started_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_source_runs_template_started"
      ON "source_runs" ("template_id", "started_at" DESC)
    `);

    // ── resumes ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "resumes" (
        "id"         text PRIMARY KEY NOT NULL,
        "user_id"    text NOT NULL,
        "title"      text NOT NULL,
        "content"    text NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}',
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD CONSTRAINT "fk_resumes_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // ── user_preferences ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_preferences" (
        "id"         text PRIMARY KEY NOT NULL,
        "user_id"    text NOT NULL,
        "items"      jsonb NOT NULL DEFAULT '[]',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "uq_user_preferences_user_id" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "fk_user_preferences_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // ── fit_analysis ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "fit_analysis" (
        "id"                   text PRIMARY KEY NOT NULL,
        "application_id"       text,
        "draft_application_id" text,
        "user_id"              text,
        "resume_id"            text NOT NULL,
        "status"               "fit_analysis_status" NOT NULL DEFAULT 'completed',
        "error"                text,
        "score_ratio"          double precision,
        "classification"       text,
        "fit_count"            integer NOT NULL DEFAULT 0,
        "gap_count"            integer NOT NULL DEFAULT 0,
        "unclear_count"        integer NOT NULL DEFAULT 0,
        "items"                jsonb NOT NULL DEFAULT '[]',
        "created_at"           timestamp NOT NULL DEFAULT now(),
        "updated_at"           timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "uq_fit_analysis_application_id" UNIQUE ("application_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "uq_fit_analysis_draft_application_id" UNIQUE ("draft_application_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fk_fit_analysis_application_id" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fk_fit_analysis_draft_application_id" FOREIGN KEY ("draft_application_id") REFERENCES "draft_applications"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fk_fit_analysis_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fk_fit_analysis_resume_id" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE`,
    );

    // ── Deferred FKs (cross-table references) ──────────────────────
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "fk_applications_draft_application" FOREIGN KEY ("draft_application_id") REFERENCES "draft_applications"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "fk_applications_source_run" FOREIGN KEY ("source_run_id") REFERENCES "source_runs"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(`
      CREATE INDEX "idx_applications_source_run" ON "applications" ("source_run_id")
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty: squashed baseline migration is not reversible.
  }
}
