import type { JobEntity } from "@api/database/entities/job.entity";

export type Job = JobEntity;

export type NewJob = Partial<Omit<JobEntity, "id" | "createdAt" | "updatedAt" | "company">> &
  Pick<JobEntity, "title" | "companyId"> &
  Partial<Pick<JobEntity, "sourceRunId">>;
