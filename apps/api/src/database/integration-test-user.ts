import { UserEntity } from "@api/database/entities/user.entity";
import { RoleEnum } from "@api/domains/users/role.enum";
import type { DataSource } from "typeorm";

export type IntegrationUserSeed = { email: string; name: string; avatarUrl?: string | null };

/** Persists a domain user for repository integration tests. */
export async function insertIntegrationUser(ds: DataSource, seed: IntegrationUserSeed): Promise<UserEntity> {
  const userRepo = ds.getRepository(UserEntity);
  return userRepo.save(
    userRepo.create({ email: seed.email, name: seed.name, avatarUrl: seed.avatarUrl ?? null, role: RoleEnum.User }),
  );
}
