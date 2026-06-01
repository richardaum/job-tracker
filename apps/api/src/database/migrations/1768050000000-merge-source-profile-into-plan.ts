import type { MigrationInterface, QueryRunner } from "typeorm";

export class MergeSourceProfileIntoPlan1768050000000 implements MigrationInterface {
  name = "MergeSourceProfileIntoPlan1768050000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    const [{ conname }] = await queryRunner.query(
      `SELECT conname FROM pg_constraint WHERE conrelid = 'source_templates'::regclass AND contype = 'u'`,
    );

    await queryRunner.query(`ALTER TABLE "source_templates" ADD COLUMN "plan_id" uuid`);

    await queryRunner.query(`
      UPDATE "source_templates" st
      SET "plan_id" = p."id"
      FROM "plans" p
      WHERE st."source_profile_id" = p."source_profile_id"
    `);

    await queryRunner.query(`ALTER TABLE "source_templates" ALTER COLUMN "plan_id" SET NOT NULL`);

    await queryRunner.query(`
      ALTER TABLE "source_templates"
      ADD CONSTRAINT "fk_source_templates_plan_id"
      FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`ALTER TABLE "source_templates" DROP CONSTRAINT "${conname}"`);

    await queryRunner.query(`ALTER TABLE "source_templates" DROP COLUMN "source_profile_id"`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_source_templates_user_plan" ON "source_templates" ("user_id", "plan_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_source_templates_user_plan"`);

    await queryRunner.query(`ALTER TABLE "source_templates" ADD COLUMN "source_profile_id" text`);

    await queryRunner.query(`
      UPDATE "source_templates" st
      SET "source_profile_id" = p."source_profile_id"
      FROM "plans" p
      WHERE st."plan_id" = p."id"
    `);

    await queryRunner.query(`ALTER TABLE "source_templates" ALTER COLUMN "source_profile_id" SET NOT NULL`);

    await queryRunner.query(`
      ALTER TABLE "source_templates"
      ADD CONSTRAINT "uq_source_templates_user_source_profile" UNIQUE ("user_id", "source_profile_id")
    `);

    await queryRunner.query(`ALTER TABLE "source_templates" DROP CONSTRAINT "fk_source_templates_plan_id"`);

    await queryRunner.query(`ALTER TABLE "source_templates" DROP COLUMN "plan_id"`);
  }
}
