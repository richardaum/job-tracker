import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { resetPublicSchemaAndMigrate } from "@api/database/test-db";
import type { DataSource } from "typeorm";

import { UserRepository } from "./users.repository";
import { UserEntity } from "@api/database/entities/user.entity";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("UserRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: UserRepository;

  beforeAll(async () => {
    dataSource = await resetPublicSchemaAndMigrate(DATABASE_URL as string);
    repo = new UserRepository(dataSource.getRepository(UserEntity));
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE application_notes, application_stage_events, applications, users CASCADE",
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
    expect(user.role).toBe("user");
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
