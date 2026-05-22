import type { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";

export type WorkPreferences = WorkPreferencesEntity;

export type NewWorkPreferences = Partial<
  Omit<WorkPreferencesEntity, "id" | "createdAt" | "updatedAt">
> &
  Pick<WorkPreferencesEntity, "userId">;
