import type { MigrationInterface, QueryRunner } from "typeorm";

/** Allows draft captures without attaching a placeholder company row. */
export class NullableJobCompanyId1767850000000 implements MigrationInterface {
  name = "NullableJobCompanyId1767850000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "company_id" DROP NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    /** Will fail while any job row still has NULL `company_id`. */
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "company_id" SET NOT NULL`,
    );
  }
}
