import type { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1746009600000 implements MigrationInterface {
  name = "Baseline1746009600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."role" AS ENUM('user')`);
    await queryRunner.query(
      `CREATE TYPE "public"."salary_period" AS ENUM('year', 'month', 'hour')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."application_stage" AS ENUM('new', 'applied', 'recruiter_screen', 'technical', 'offer', 'rejected')`,
    );
    await queryRunner.query(`CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
)`);
    await queryRunner.query(`CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"description" text,
	"url" text,
	"salary_min_cents" integer,
	"salary_max_cents" integer,
	"salary_currency" text,
	"salary_period" "salary_period",
	"salary_tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
)`);
    await queryRunner.query(`CREATE TABLE "application_stage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"user_id" text NOT NULL,
	"from_stage" "application_stage",
	"to_stage" "application_stage" NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"schedule_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
)`);
    await queryRunner.query(`CREATE TABLE "application_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
)`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD CONSTRAINT "application_stage_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" ADD CONSTRAINT "application_stage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_notes" DROP CONSTRAINT "application_notes_user_id_users_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_notes" DROP CONSTRAINT "application_notes_application_id_applications_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" DROP CONSTRAINT "application_stage_events_user_id_users_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_stage_events" DROP CONSTRAINT "application_stage_events_application_id_applications_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "applications_user_id_users_id_fk"`,
    );
    await queryRunner.query(`DROP TABLE "application_notes"`);
    await queryRunner.query(`DROP TABLE "application_stage_events"`);
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."application_stage"`);
    await queryRunner.query(`DROP TYPE "public"."salary_period"`);
    await queryRunner.query(`DROP TYPE "public"."role"`);
  }
}
