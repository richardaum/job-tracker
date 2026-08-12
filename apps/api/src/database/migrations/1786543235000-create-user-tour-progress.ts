import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTourProgress1786543235000 implements MigrationInterface {
  name = "CreateUserTourProgress1786543235000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "tour_progress_status" AS ENUM ('InProgress', 'Completed', 'Skipped')`);

    await queryRunner.query(`
      CREATE TABLE "user_tour_progress" (
        "id" text NOT NULL,
        "user_id" text NOT NULL,
        "tour_id" text NOT NULL,
        "tour_version" integer NOT NULL DEFAULT 1,
        "status" "tour_progress_status" NOT NULL DEFAULT 'InProgress',
        "current_step_id" text,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "skipped_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_tour_progress" PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_tour_progress_user_tour" UNIQUE ("user_id", "tour_id"),
        CONSTRAINT "FK_user_tour_progress_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_tour_progress"`);
    await queryRunner.query(`DROP TYPE "tour_progress_status"`);
  }
}
