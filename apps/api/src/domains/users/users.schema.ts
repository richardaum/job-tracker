import type { UserEntity } from "@api/database/entities/user.entity";

export type User = UserEntity;

export type NewUser = Pick<
  UserEntity,
  "googleId" | "email" | "name" | "avatarUrl"
> &
  Partial<Pick<UserEntity, "id" | "role">>;
