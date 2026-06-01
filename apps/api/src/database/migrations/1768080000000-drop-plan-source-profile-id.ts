import type { MigrationInterface, QueryRunner } from "typeorm";

export class DropPlanSourceProfileId1768080000000 implements MigrationInterface {
  name = "DropPlanSourceProfileId1768080000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "source_profile_id"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "source_profile_id" varchar(256)`);
    await queryRunner.query(
      `ALTER TABLE "plans" ADD CONSTRAINT "UQ_plans_source_profile_id" UNIQUE ("source_profile_id")`,
    );
  }
}
