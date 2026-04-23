CREATE TYPE "public"."salary_period" AS ENUM('year', 'month', 'hour');--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "salary_min_cents" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "salary_max_cents" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "salary_currency" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "salary_period" "salary_period";--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "salary_tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;