import type { JobEntity } from "@api/database/entities/job.entity";

export type Job = Omit<JobEntity, "setId">;

export type NewJob = Partial<
  Omit<JobEntity, "id" | "createdAt" | "updatedAt" | "setId" | "company">
> &
  Pick<JobEntity, "title" | "companyId"> &
  Partial<Pick<JobEntity, "sourceRunId">>;
