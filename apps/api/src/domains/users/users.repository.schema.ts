import type { AuthProviderEnum } from "./auth-provider.enum";
import type { RoleEnum } from "./role.enum";

export type SaveUserRepoDto = { id: string; email: string; name: string; avatarUrl: string | null; role?: RoleEnum };

export type InsertUserRepoDto = { id: string; email: string; name: string; avatarUrl: string | null; role: RoleEnum };

export type InsertAccountRepoDto = {
  id: string;
  userId: string;
  providerName: AuthProviderEnum;
  providerAccountId: string;
};
