import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastActiveAtToUsers1788000000000 implements MigrationInterface {
  name = "AddLastActiveAtToUsers1788000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD COLUMN last_active_at timestamptz`);
    await queryRunner.query(`
      UPDATE users AS domain_user
      SET last_active_at = sessions.last_active_at
      FROM (
        SELECT "userId" AS user_id, MAX("updatedAt") AS last_active_at
        FROM "session"
        GROUP BY "userId"
      ) AS sessions
      WHERE domain_user.id::uuid = sessions.user_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN last_active_at`);
  }
}
