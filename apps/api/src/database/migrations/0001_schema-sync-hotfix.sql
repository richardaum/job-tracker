ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "applications" DROP COLUMN IF EXISTS "applied_at";
-- Custom SQL migration file, put your code below! --