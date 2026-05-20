import type { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";

export type JobStageEvent = Omit<JobStageEventEntity, "setId">;

export type NewJobStageEvent = Pick<
  JobStageEventEntity,
  "jobId" | "userId" | "fromStage" | "toStage"
> & { source?: string; reason?: string | null; scheduledAt?: Date | null };
