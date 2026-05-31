import type { MigrationInterface, QueryRunner } from "typeorm";

export class MakeDraftJobUrlNullable1764300000000 implements MigrationInterface {
  name = "MakeDraftJobUrlNullable1764300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "draft_applications" ALTER COLUMN "url" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "draft_applications" ALTER COLUMN "url" SET NOT NULL`);
  }
}
