import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";

const hasDb = !!process.env.DATABASE_E2E_URL;

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

  it("upsert creates a new user", async () => {
    const user = await repo.upsert({
      googleId: "google-123",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
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

  it("upsert updates existing user on conflict", async () => {
    const updated = await repo.upsert({
      googleId: "google-123",
      email: "test@example.com",
      name: "Updated Name",
      avatarUrl: null,
    });
    expect(updated.name).toBe("Updated Name");
    expect(updated.googleId).toBe("google-123");
  });
});
