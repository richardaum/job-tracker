import type { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSurfaceUrlMandatory1764000000000 implements MigrationInterface {
  name = "MakeSurfaceUrlMandatory1764000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "import_templates" ALTER COLUMN "surface_url" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "import_runs" ALTER COLUMN "surface_url" DROP NOT NULL;
    `);
  }
}
