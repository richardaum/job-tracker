import { MigrationInterface, QueryRunner } from "typeorm";

export class DropImportRunsImporterName1763600000000 implements MigrationInterface {
  name = "DropImportRunsImporterName1763600000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "import_runs" DROP COLUMN "importer_name"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "import_runs" ADD "importer_name" text NOT NULL DEFAULT ''`,
    );
  }
}
