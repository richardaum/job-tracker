import type { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillJobSourceRemoteyeah1763400000001 implements MigrationInterface {
  name = "BackfillJobSourceRemoteyeah1763400000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
UPDATE "applications"
SET "source" = 'RemoteYeah'::"public"."application_source"
WHERE "source" IS NULL
  AND EXISTS (
    SELECT 1
    FROM unnest("urls") AS u
    WHERE lower(u) LIKE '%remoteyeah%'
  );
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
UPDATE "applications"
SET "source" = NULL
WHERE "source" = 'RemoteYeah'::"public"."application_source";
`);
  }
}
