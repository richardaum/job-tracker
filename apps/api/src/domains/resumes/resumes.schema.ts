import type { ResumeEntity } from "@api/database/entities/resume.entity";

export type Resume = ResumeEntity;

export type NewResume = Partial<
  Omit<ResumeEntity, "id" | "createdAt" | "updatedAt">
> &
  Pick<ResumeEntity, "title" | "content" | "userId">;
