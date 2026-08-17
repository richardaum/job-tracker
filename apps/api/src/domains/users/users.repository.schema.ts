import type { AuthProviderEnum } from "./auth-provider.enum";
import type { RoleEnum } from "./role.enum";
import type { UserStatusEnum } from "./user-status.enum";

export type SaveUserRepoDto = { id: string; email: string; name: string; avatarUrl: string | null; role?: RoleEnum };

export type InsertUserRepoDto = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: RoleEnum;
  status: UserStatusEnum;
};

export type InsertAccountRepoDto = {
  id: string;
  userId: string;
  providerName: AuthProviderEnum;
  providerAccountId: string;
};
