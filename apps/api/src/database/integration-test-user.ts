import { randomUUID } from "node:crypto";

import { UserEntity } from "@api/database/entities/user.entity";
import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { AuthProviderEnum } from "@api/domains/users/auth-provider.enum";
import { RoleEnum } from "@api/domains/users/role.enum";
import type { DataSource } from "typeorm";

export type OAuthIntegrationUserSeed = {
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

/** Persists user + OAuth account row (integration tests against migrated schema). */
export async function insertUserWithAuthAccount(ds: DataSource, seed: OAuthIntegrationUserSeed): Promise<UserEntity> {
  const userRepo = ds.getRepository(UserEntity);
  const accounts = ds.getRepository(UserAccountEntity);

  const user = await userRepo.save(
    userRepo.create({ email: seed.email, name: seed.name, avatarUrl: seed.avatarUrl ?? null, role: RoleEnum.User }),
  );

  await accounts.save(
    accounts.create({
      id: randomUUID(),
      userId: user.id,
      providerName: AuthProviderEnum.Google,
      providerAccountId: seed.providerAccountId,
    }),
  );

  return user;
}
