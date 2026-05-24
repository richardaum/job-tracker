import type { UserEntity } from "@api/database/entities/user.entity";

import type { AuthProviderEnum } from "./auth-provider.enum";

export type User = UserEntity;

/** OAuth profile used to find-or-create a user + optional new provider link. */
export type NewUser = {
  providerName: AuthProviderEnum;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
} & Partial<Pick<UserEntity, "id" | "role">>;
