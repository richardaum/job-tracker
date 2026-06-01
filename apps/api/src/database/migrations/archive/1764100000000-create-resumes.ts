import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResumes1764100000000 implements MigrationInterface {
  name = "CreateResumes1764100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "resumes" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "title" text NOT NULL,
      "content" text NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}',
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`);

    await queryRunner.query(
      `ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resumes" DROP CONSTRAINT "resumes_user_id_users_id_fk"`);
    await queryRunner.query(`DROP TABLE "resumes"`);
  }
}
