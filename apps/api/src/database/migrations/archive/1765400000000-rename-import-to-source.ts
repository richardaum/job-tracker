import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameImportToSource1765400000000 implements MigrationInterface {
  name = "RenameImportToSource1765400000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop FK + index on applications before table rename
    await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_import_run"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_applications_import_run"`);

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
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop new FK and index
    await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_source_run"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_applications_source_run"`);

    // 2. Rename indexes back
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER INDEX "IDX_source_runs_user_started" RENAME TO "IDX_import_runs_user_started";
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER INDEX "IDX_source_runs_template_started" RENAME TO "IDX_import_runs_template_started";
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER INDEX "IDX_source_templates_user" RENAME TO "IDX_import_templates_user";
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);

    // 3. Rename constraints back
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "source_runs" RENAME CONSTRAINT "PK_source_runs" TO "PK_import_runs";
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "source_templates" RENAME CONSTRAINT "PK_source_templates" TO "PK_import_templates";
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "source_templates" RENAME CONSTRAINT "UQ_source_templates_user_source_profile" TO "UQ_import_templates_user_importer";
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);

    // 4. Rename columns back
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "source_templates" RENAME COLUMN "source_profile_id" TO "importer_id";
      EXCEPTION
        WHEN undefined_column THEN NULL;
      END $$;
    `);

    // 5. Rename tables back
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "source_runs" RENAME TO "import_runs";
      EXCEPTION
        WHEN duplicate_table THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "source_templates" RENAME TO "import_templates";
      EXCEPTION
        WHEN duplicate_table THEN NULL;
      END $$;
    `);

    // 6. Rename column on applications back
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "applications" RENAME COLUMN "source_run_id" TO "import_run_id";
      EXCEPTION
        WHEN undefined_column THEN NULL;
      END $$;
    `);

    // 7. Rename enum type back
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "public"."source_run_status" RENAME TO "import_run_status";
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // 8. Re-create old FK and index
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_import_run" FOREIGN KEY ("import_run_id") REFERENCES "import_runs"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_applications_import_run" ON "applications" ("import_run_id")
    `);
  }
}
