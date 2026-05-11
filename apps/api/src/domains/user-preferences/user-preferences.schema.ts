import type { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";

export type UserPreferences = Omit<UserPreferencesEntity, "setId">;

export type NewUserPreferences = Partial<
  Omit<UserPreferencesEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<UserPreferencesEntity, "userId">;
