import { MigrationInterface, QueryRunner } from "typeorm";

export class DropImportRunsEntryUrl1763500000000 implements MigrationInterface {
  name = "DropImportRunsEntryUrl1763500000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "import_runs" DROP COLUMN "entry_url"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "import_runs" ADD "entry_url" text`);
  }
}
