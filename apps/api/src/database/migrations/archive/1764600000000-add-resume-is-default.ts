import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddResumeIsDefault1764600000000 implements MigrationInterface {
  name = "AddResumeIsDefault1764600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD COLUMN "is_default" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resumes" DROP COLUMN "is_default"`);
  }
}
