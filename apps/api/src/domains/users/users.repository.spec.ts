import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { UserRepository } from "./users.repository";
import { users } from "./users.schema";
import { DatabaseService } from "../../database/database.service";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("UserRepository (integration)", () => {
  let pool: Pool;
  let dbService: DatabaseService;
  let repo: UserRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "../../database/migrations"),
    });
    dbService = { db } as unknown as DatabaseService;
    repo = new UserRepository(dbService);
    await db.delete(users);
  });

  afterAll(async () => {
    await dbService.db.delete(users);
    await pool.end();
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
