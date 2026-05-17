import type { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";

export type WorkPreferences = Omit<WorkPreferencesEntity, "setId">;

export type NewWorkPreferences = Partial<
  Omit<WorkPreferencesEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<WorkPreferencesEntity, "userId">;
