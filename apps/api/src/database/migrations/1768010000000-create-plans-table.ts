import remoteyeahPlan from "@api/domains/sources/fixtures/plan3.example.json";
import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlansTable1768010000000 implements MigrationInterface {
  name = "CreatePlansTable1768010000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "source_profile_id" varchar(256) NOT NULL,
        "display_name" varchar(256) NOT NULL,
        "document" jsonb NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plans" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_plans_source_profile_id" UNIQUE ("source_profile_id")
      )
    `);

    await queryRunner.query(
      `INSERT INTO "plans" ("source_profile_id", "display_name", "document")
       VALUES ($1, $2, $3::jsonb)`,
      ["remoteyeah", "RemoteYeah", JSON.stringify(remoteyeahPlan)],
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "plans"`);
  }
}
