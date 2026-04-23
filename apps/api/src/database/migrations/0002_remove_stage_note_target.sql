ALTER TABLE "application_notes" DROP CONSTRAINT IF EXISTS "application_notes_stage_event_id_application_stage_events_id_fk";
ALTER TABLE "application_notes" DROP CONSTRAINT IF EXISTS "application_notes_exactly_one_target";
ALTER TABLE "application_notes" DROP COLUMN IF EXISTS "stage_event_id";
ALTER TABLE "application_notes" ALTER COLUMN "application_id" SET NOT NULL;
