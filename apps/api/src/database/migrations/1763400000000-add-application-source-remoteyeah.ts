import type { MigrationInterface, QueryRunner } from "typeorm";

/** Adds Postgres enum label — backfill follows in next migration (`transaction: "each"`). */
export class AddApplicationSourceRemoteyeah1763400000000 implements MigrationInterface {
  name = "AddApplicationSourceRemoteyeah1763400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE "public"."application_source" ADD VALUE IF NOT EXISTS 'RemoteYeah';
`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
