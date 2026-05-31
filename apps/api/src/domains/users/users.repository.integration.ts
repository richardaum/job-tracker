import { UserEntity } from "@api/database/entities/user.entity";
import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { createTestDataSource } from "@api/database/test-db";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("UserRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: UserRepository;
  let service: UserService;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new UserRepository(dataSource.getRepository(UserEntity), dataSource.getRepository(UserAccountEntity));
    service = new UserService(repo, new ActiveUserCacheService());
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query("TRUNCATE job_notes, job_stage_events, jobs, users CASCADE");
      await dataSource.destroy();
    }
  });

  it("findByProvider returns null when user does not exist", async () => {
    const result = await repo.findByProvider(AuthProviderEnum.GOOGLE, "nonexistent-id");
    expect(result).toBeNull();
  });

  it("findOrCreateFromGoogle creates a new user", async () => {
    const user = await service.findOrCreateFromGoogle({
      googleId: "google-123",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
    });
    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe(RoleEnum.User);
    expect(user.id).toBeDefined();
    const linked = await dataSource
      .getRepository(UserAccountEntity)
      .findOne({ where: { providerName: AuthProviderEnum.GOOGLE, providerAccountId: "google-123" } });
    expect(linked?.userId).toBe(user.id);
  });

  it("findByProvider returns existing user", async () => {
    const user = await repo.findByProvider(AuthProviderEnum.GOOGLE, "google-123");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("test@example.com");
  });

  it("findOrCreateFromGoogle updates existing user on conflict", async () => {
    const updated = await service.findOrCreateFromGoogle({
      googleId: "google-123",
      email: "test@example.com",
      name: "Updated Name",
      avatarUrl: null,
    });
    expect(updated.name).toBe("Updated Name");
    expect(updated.id).toBeDefined();
  });
});
