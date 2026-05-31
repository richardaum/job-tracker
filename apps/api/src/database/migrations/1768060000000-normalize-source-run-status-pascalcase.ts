import type { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeSourceRunStatusPascalcase1768060000000 implements MigrationInterface {
  name = "NormalizeSourceRunStatusPascalcase1768060000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    const newValues = ["Pending", "Completed", "Failed"];
    const tmp = "source_run_status_pc";

    await queryRunner.query(`CREATE TYPE "${tmp}" AS ENUM (${newValues.map((v) => `'${v}'`).join(", ")})`);

    await queryRunner.query(`ALTER TABLE "source_runs" ALTER COLUMN "status" DROP DEFAULT`);

    await queryRunner.query(
      `ALTER TABLE "source_runs" ALTER COLUMN "status" TYPE "${tmp}" USING CASE "status"::text
        WHEN 'RUNNING' THEN 'Pending'::"${tmp}"
        WHEN 'IN_PROGRESS' THEN 'Pending'::"${tmp}"
        WHEN 'COMPLETED' THEN 'Completed'::"${tmp}"
        WHEN 'FAILED' THEN 'Failed'::"${tmp}"
        ELSE 'Pending'::"${tmp}"
      END`,
    );

    await queryRunner.query(`ALTER TABLE "source_runs" ALTER COLUMN "status" SET DEFAULT 'Pending'::"${tmp}"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "source_run_status" CASCADE`);

    await queryRunner.query(`ALTER TYPE "${tmp}" RENAME TO "source_run_status"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const newValues = ["RUNNING", "IN_PROGRESS", "COMPLETED", "FAILED"];
    const tmp = "source_run_status_old";

    await queryRunner.query(`CREATE TYPE "${tmp}" AS ENUM (${newValues.map((v) => `'${v}'`).join(", ")})`);

    await queryRunner.query(`ALTER TABLE "source_runs" ALTER COLUMN "status" DROP DEFAULT`);

    await queryRunner.query(
      `ALTER TABLE "source_runs" ALTER COLUMN "status" TYPE "${tmp}" USING CASE "status"::text
        WHEN 'Pending' THEN 'RUNNING'::"${tmp}"
        WHEN 'Completed' THEN 'COMPLETED'::"${tmp}"
        WHEN 'Failed' THEN 'FAILED'::"${tmp}"
        ELSE 'RUNNING'::"${tmp}"
      END`,
    );

    await queryRunner.query(`ALTER TABLE "source_runs" ALTER COLUMN "status" SET DEFAULT 'RUNNING'::"${tmp}"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "source_run_status" CASCADE`);

    await queryRunner.query(`ALTER TYPE "${tmp}" RENAME TO "source_run_status"`);
  }
}
