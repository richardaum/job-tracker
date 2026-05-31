import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMatchAnalysis1764400000000 implements MigrationInterface {
  name = "CreateMatchAnalysis1764400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "fit_analysis" (
      "id" text PRIMARY KEY NOT NULL,
      "application_id" text NOT NULL,
      "resume_id" text NOT NULL,
      "score_ratio" double precision,
      "classification" text,
      "fit_count" integer DEFAULT 0 NOT NULL,
      "gap_count" integer DEFAULT 0 NOT NULL,
      "unclear_count" integer DEFAULT 0 NOT NULL,
      "items" jsonb DEFAULT '[]' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`);

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fit_analysis_application_id_unique" UNIQUE ("application_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fit_analysis_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action`,
    );

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD CONSTRAINT "fit_analysis_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fit_analysis" DROP CONSTRAINT "fit_analysis_resume_id_resumes_id_fk"`);
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" DROP CONSTRAINT "fit_analysis_application_id_applications_id_fk"`,
    );
    await queryRunner.query(`ALTER TABLE "fit_analysis" DROP CONSTRAINT "fit_analysis_application_id_unique"`);
    await queryRunner.query(`DROP TABLE "fit_analysis"`);
  }
}
