import { randomUUID } from "node:crypto";

import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("UserRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: UserRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new UserRepository(dataSource.getRepository(UserEntity));
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE job_notes, job_stage_events, jobs, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  it("findByGoogleId returns null when user does not exist", async () => {
    const result = await repo.findByGoogleId("nonexistent-id");
    expect(result).toBeNull();
  });

  it("create inserts a new user", async () => {
    const user = await repo.create({
      id: randomUUID(),
      googleId: "google-123",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
      role: RoleEnum.User,
    });
    expect(user.googleId).toBe("google-123");
    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe(RoleEnum.User);
    expect(user.id).toBeDefined();
  });

  it("findByGoogleId returns existing user", async () => {
    const user = await repo.findByGoogleId("google-123");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("test@example.com");
  });

  it("updateProfile updates an existing user", async () => {
    const existing = await repo.findByGoogleId("google-123");
    expect(existing).not.toBeNull();

    const updated = await repo.updateProfile(existing!.id, {
      email: "test@example.com",
      name: "Updated Name",
      avatarUrl: null,
    });
    expect(updated?.name).toBe("Updated Name");
    expect(updated?.googleId).toBe("google-123");
  });
});
