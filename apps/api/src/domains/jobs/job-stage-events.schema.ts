import type { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";

export type JobStageEvent = Omit<JobStageEventEntity, "setId">;

export type NewJobStageEvent = Omit<
  JobStageEventEntity,
  "id" | "createdAt" | "setId"
>;
