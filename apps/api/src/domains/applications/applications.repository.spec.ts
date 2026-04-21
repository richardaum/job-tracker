import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { ApplicationRepository } from "./applications.repository";
import { applications } from "./applications.schema";
import { users } from "@api/domains/users/users.schema";
import { DatabaseService } from "@api/database/database.service";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("ApplicationRepository (integration)", () => {
  let pool: Pool;
  let dbService: DatabaseService;
  let repo: ApplicationRepository;
  let userId: string;

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "../../database/migrations"),
    });
    dbService = { db } as unknown as DatabaseService;
    repo = new ApplicationRepository(dbService);

    await db.delete(applications);
    await db.delete(users);

    const [user] = await db
      .insert(users)
      .values({
        googleId: "google-app-repo-test",
        email: "apprepo@example.com",
        name: "App Repo User",
        avatarUrl: null,
      })
      .returning();
    userId = user.id;
  });

  afterAll(async () => {
    await dbService.db.delete(applications);
    await dbService.db.delete(users);
    await pool.end();
  });

  it("findAllByUserId returns empty array when no applications", async () => {
    const result = await repo.findAllByUserId(userId);
    expect(result).toEqual([]);
  });

  it("create inserts a new application", async () => {
    const app = await repo.create(userId, {
      title: "Software Engineer",
      company: "Acme Corp",
      url: "https://acme.com/jobs/1",
      appliedAt: new Date("2026-01-01"),
    });
    expect(app.id).toBeDefined();
    expect(app.userId).toBe(userId);
    expect(app.title).toBe("Software Engineer");
    expect(app.company).toBe("Acme Corp");
  });

  it("findAllByUserId returns only the user's applications", async () => {
    const result = await repo.findAllByUserId(userId);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Software Engineer");
  });

  it("findOneByIdAndUserId returns application when owner matches", async () => {
    const [app] = await repo.findAllByUserId(userId);
    const found = await repo.findOneByIdAndUserId(app.id, userId);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(app.id);
  });

  it("findOneByIdAndUserId returns null when owner does not match", async () => {
    const [app] = await repo.findAllByUserId(userId);
    const found = await repo.findOneByIdAndUserId(app.id, "wrong-user-id");
    expect(found).toBeNull();
  });

  it("update modifies the application", async () => {
    const [app] = await repo.findAllByUserId(userId);
    const updated = await repo.update(app.id, userId, {
      title: "Senior Engineer",
    });
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Senior Engineer");
  });

  it("delete removes the application", async () => {
    const [app] = await repo.findAllByUserId(userId);
    const deleted = await repo.delete(app.id, userId);
    expect(deleted).not.toBeNull();
    const remaining = await repo.findAllByUserId(userId);
    expect(remaining).toHaveLength(0);
  });

  it("findAllByUserId does not return other users' applications", async () => {
    const [otherUser] = await dbService.db
      .insert(users)
      .values({
        googleId: "google-other-user",
        email: "other@example.com",
        name: "Other User",
        avatarUrl: null,
      })
      .returning();

    await repo.create(otherUser.id, {
      title: "Other User's Job",
      company: "Other Corp",
      url: null,
      appliedAt: new Date("2026-01-01"),
    });

    const result = await repo.findAllByUserId(userId);
    expect(result.every((a) => a.userId === userId)).toBe(true);
  });
});
