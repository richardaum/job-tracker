import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserStatusEnum1786600000000 implements MigrationInterface {
  name = "UserStatusEnum1786600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "user_status" AS ENUM ('Pending', 'Active', 'Rejected', 'Deactivated')`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "status" "user_status" NOT NULL DEFAULT 'Active'`);

    await queryRunner.query(`
      UPDATE "users"
      SET "status" = CASE WHEN "active" = true THEN 'Active'::user_status ELSE 'Deactivated'::user_status END
    `);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "active" boolean NOT NULL DEFAULT true`);

    await queryRunner.query(`UPDATE "users" SET "active" = ("status" = 'Active')`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);

    await queryRunner.query(`DROP TYPE "user_status"`);
  }
}
