import type { MigrationInterface, QueryRunner } from "typeorm";

const REMOTEYEAH_SURFACE_URL =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide";

export class ImportTemplatesAndRunSurfaceUrl1763900000000 implements MigrationInterface {
  name = "ImportTemplatesAndRunSurfaceUrl1763900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_applications_import_run"`,
    );
    await queryRunner.query(`
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_import_run";
`);
    await queryRunner.query(`
ALTER TABLE "applications" DROP COLUMN IF EXISTS "import_run_id";
`);

    await queryRunner.query(`
ALTER TABLE "import_runs" ADD COLUMN IF NOT EXISTS "importer_id" text;
`);
    await queryRunner.query(`
UPDATE "import_runs" r
SET "importer_id" = t."importer_id"
FROM "import_templates" t
WHERE r."template_id" = t."id";
`);
    await queryRunner.query(`
ALTER TABLE "import_runs" ALTER COLUMN "importer_id" SET NOT NULL;
`);

    await queryRunner.query(`
DROP INDEX IF EXISTS "IDX_import_runs_template_started";
`);
    await queryRunner.query(`
ALTER TABLE "import_runs" DROP CONSTRAINT IF EXISTS "FK_import_runs_template";
`);
    await queryRunner.query(`
ALTER TABLE "import_runs" DROP COLUMN IF EXISTS "template_id";
`);
    await queryRunner.query(`
ALTER TABLE "import_runs" DROP COLUMN IF EXISTS "surface_url";
`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_import_templates_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "import_templates"`);
  }
}
