import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobStageCulturalFit1763300001000 implements MigrationInterface {
  name = "AddJobStageCulturalFit1763300001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE "public"."application_stage" ADD VALUE IF NOT EXISTS 'cultural_fit';
`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
