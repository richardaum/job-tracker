import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { resetPublicSchemaAndMigrate } from "@api/database/test-db";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { NoteRepository } from "./notes.repository";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("NoteRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: NoteRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await resetPublicSchemaAndMigrate(DATABASE_URL as string);
    repo = new NoteRepository(
      dataSource.getRepository(ApplicationEntity),
      dataSource.getRepository(ApplicationNoteEntity),
    );

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-note-repo-test",
        email: "noterepo@example.com",
        name: "Note Repo User",
        avatarUrl: null,
        role: "user",
      }),
    );
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE companies, application_notes, application_stage_events, applications, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  async function createTestApplication(uId: string, companyName: string) {
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const company = await companyRepo.save(
      companyRepo.create({ userId: uId, name: companyName }),
    );
    const appRepo = dataSource.getRepository(ApplicationEntity);
    return appRepo.save(
      appRepo.create({
        userId: uId,
        title: "Backend Engineer",
        companyId: company.id,
        urls: [],
      }),
    );
  }

  it("hasApplication returns true for owned app", async () => {
    const app = await createTestApplication(userId, "Owned Corp");
    const hasApp = await repo.hasApplication(app.id, userId);
    expect(hasApp).toBe(true);
  });

  it("hasApplication returns false for non-owned app", async () => {
    const app = await createTestApplication(userId, "Hidden Corp");
    const hasApp = await repo.hasApplication(app.id, "wrong-user-id");
    expect(hasApp).toBe(false);
  });

  it("enforces note revision checks on update", async () => {
    const app = await createTestApplication(userId, "Revision Corp");
    const note = await repo.create(userId, {
      applicationId: app.id,
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    });

    const staleUpdate = await repo.updateWithRevision(
      note.id,
      userId,
      note.revision + 1,
      { content: "Outdated write" },
    );
    expect(staleUpdate).toBeNull();

    const validUpdate = await repo.updateWithRevision(
      note.id,
      userId,
      note.revision,
      { content: "Updated with valid revision" },
    );
    expect(validUpdate).not.toBeNull();
    expect(validUpdate?.revision).toBe(note.revision + 1);
    expect(validUpdate?.content).toBe("Updated with valid revision");
  });

  it("returns application notes in desc order", async () => {
    const app = await createTestApplication(userId, "Order Corp");
    const notesRepo = dataSource.getRepository(ApplicationNoteEntity);
    await notesRepo.save(
      notesRepo.create({
        applicationId: app.id,
        userId,
        content: "older",
        createdAt: new Date("2030-01-01T09:00:00.000Z"),
        updatedAt: new Date("2030-01-01T09:00:00.000Z"),
      }),
    );
    await notesRepo.save(
      notesRepo.create({
        applicationId: app.id,
        userId,
        content: "newer",
        createdAt: new Date("2030-01-01T10:00:00.000Z"),
        updatedAt: new Date("2030-01-01T10:00:00.000Z"),
      }),
    );

    const ordered = await repo.findByApplicationIdAndUserId(app.id, userId);
    expect(ordered).toHaveLength(2);
    expect(ordered.map((n) => n.content)).toEqual(["newer", "older"]);
  });

  it("delete removes and returns note", async () => {
    const app = await createTestApplication(userId, "Delete Corp");
    const note = await repo.create(userId, {
      applicationId: app.id,
      content: "to-delete",
    });

    const deleted = await repo.delete(note.id, userId);
    expect(deleted?.id).toBe(note.id);

    const missing = await repo.findByIdAndUserId(note.id, userId);
    expect(missing).toBeNull();
  });
});
