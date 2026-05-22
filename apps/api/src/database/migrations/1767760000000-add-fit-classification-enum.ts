import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddFitClassificationEnum1767760000000 implements MigrationInterface {
  name = "AddFitClassificationEnum1767760000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "fit_classification" AS ENUM ('Positive', 'Neutral', 'Negative')`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ALTER COLUMN "classification" SET DATA TYPE "fit_classification" USING CASE "classification"
        WHEN 'positive' THEN 'Positive'::"fit_classification"
        WHEN 'neutral' THEN 'Neutral'::"fit_classification"
        WHEN 'negative' THEN 'Negative'::"fit_classification"
        ELSE "classification"::"fit_classification"
      END`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ALTER COLUMN "classification" SET DATA TYPE text`,
    );
    await queryRunner.query(`DROP TYPE "fit_classification"`);
  }
}
