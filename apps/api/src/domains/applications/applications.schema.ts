import type { ApplicationEntity } from "@api/database/entities/application.entity";

export type Application = Omit<ApplicationEntity, "setId">;

export type NewApplication = Partial<
  Omit<ApplicationEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<ApplicationEntity, "title" | "company">;
