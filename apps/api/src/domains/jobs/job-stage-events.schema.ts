import type { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";

export type JobStageEvent = JobStageEventEntity;

export type NewJobStageEvent = Omit<JobStageEventEntity, "id" | "createdAt" | "setId">;
