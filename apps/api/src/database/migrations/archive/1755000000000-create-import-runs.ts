import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateImportRuns1755000000000 implements MigrationInterface {
  name = "CreateImportRuns1755000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "import_runs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."import_run_status"`);
  }
}
