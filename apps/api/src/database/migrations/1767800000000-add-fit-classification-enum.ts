import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddFitClassificationEnum1767800000000 implements MigrationInterface {
  name = "AddFitClassificationEnum1767800000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "fit_classification" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ALTER COLUMN "classification" SET DATA TYPE "fit_classification" USING UPPER("classification")::"fit_classification"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ALTER COLUMN "classification" SET DATA TYPE text`,
    );
    await queryRunner.query(`DROP TYPE "fit_classification"`);
  }
}
