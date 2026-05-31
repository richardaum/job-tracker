import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceTemplateConfigJsonb1768090000000 implements MigrationInterface {
  name = "AddSourceTemplateConfigJsonb1768090000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "source_templates" ADD COLUMN "config" jsonb`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "source_templates" DROP COLUMN "config"`);
  }
}
