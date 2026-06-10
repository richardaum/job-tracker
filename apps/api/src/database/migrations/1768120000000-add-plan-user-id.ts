import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanUserId1768120000000 implements MigrationInterface {
  name = "AddPlanUserId1768120000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "user_id" text`);

    const [{ count: plansWithoutUserCount }] = (await queryRunner.query(
      `SELECT COUNT(*)::text AS count FROM "plans" WHERE "user_id" IS NULL`,
    )) as Array<{ count: string }>;

    if (Number(plansWithoutUserCount) > 0) {
      const users = (await queryRunner.query(`SELECT id FROM "users" ORDER BY "created_at" ASC LIMIT 1`)) as Array<{
        id: string;
      }>;
      const defaultUserId = users[0]?.id;

      if (defaultUserId) {
        await queryRunner.query(`UPDATE "plans" SET "user_id" = $1 WHERE "user_id" IS NULL`, [defaultUserId]);
      } else {
        await queryRunner.query(`DELETE FROM "plans" WHERE "user_id" IS NULL`);
      }
    }

    await queryRunner.query(`ALTER TABLE "plans" ALTER COLUMN "user_id" SET NOT NULL`);

    await queryRunner.query(`
      ALTER TABLE "plans"
      ADD CONSTRAINT "fk_plans_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "fk_plans_user_id"`);
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "user_id"`);
  }
}
