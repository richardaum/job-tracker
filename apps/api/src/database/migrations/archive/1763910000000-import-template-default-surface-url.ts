import type { MigrationInterface, QueryRunner } from "typeorm";

export class ImportTemplateDefaultSurfaceUrl1763910000000 implements MigrationInterface {
  name = "ImportTemplateDefaultSurfaceUrl1763910000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE "import_templates" ADD COLUMN IF NOT EXISTS "surface_url" text;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE "import_templates" DROP COLUMN IF EXISTS "surface_url";
`);
  }
}
