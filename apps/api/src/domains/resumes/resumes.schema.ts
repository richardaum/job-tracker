import type { ResumeEntity } from "@api/database/entities/resume.entity";

export type Resume = Omit<ResumeEntity, "setId">;

export type NewResume = Partial<
  Omit<ResumeEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<ResumeEntity, "title" | "content" | "userId">;
