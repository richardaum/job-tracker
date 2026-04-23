import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { DataSource } from "typeorm";

import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { resetPublicSchemaAndMigrate } from "@api/database/test-db";

import { ApplicationRepository } from "./applications.repository";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("ApplicationRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: ApplicationRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await resetPublicSchemaAndMigrate(DATABASE_URL as string);
    repo = new ApplicationRepository(
      dataSource.getRepository(ApplicationEntity),
      dataSource.getRepository(ApplicationStageEventEntity),
      dataSource.getRepository(ApplicationNoteEntity),
    );

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-app-repo-test",
        email: "apprepo@example.com",
        name: "App Repo User",
        avatarUrl: null,
        role: "user",
      }),
    );
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE application_notes, application_stage_events, applications, users CASCADE",
      );
      await dataSource.destroy();
    }
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
    const userRepo = dataSource.getRepository(UserEntity);
    const otherUser = await userRepo.save(
      userRepo.create({
        googleId: "google-other-user",
        email: "other@example.com",
        name: "Other User",
        avatarUrl: null,
        role: "user",
      }),
    );

    await repo.create(otherUser.id, {
      title: "Other User's Job",
      company: "Other Corp",
      url: null,
    });

    const result = await repo.findAllByUserId(userId);
    expect(result.every((a) => a.userId === userId)).toBe(true);
  });

  it("stores and returns stage events in desc order using scheduledAt fallback createdAt", async () => {
    const app = await repo.create(userId, {
      title: "Platform Engineer",
      company: "Timeline Corp",
      url: null,
    });

    const first = await repo.createStageEvent(userId, app.id, {
      fromStage: null,
      toStage: "applied",
      source: "manual",
      scheduledAt: new Date("2030-01-01T09:00:00.000Z"),
    });
    const second = await repo.createStageEvent(userId, app.id, {
      fromStage: "applied",
      toStage: "technical",
      source: "manual",
      scheduledAt: null,
    });

    const events = await repo.findStageEventsByApplicationIdAndUserId(
      app.id,
      userId,
    );
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe(first.id);
    expect(events[0].toStage).toBe("applied");
    expect(events[1].id).toBe(second.id);
    expect(events[1].fromStage).toBe("applied");
    expect(events[1].toStage).toBe("technical");
  });

  it("enforces note revision checks on update", async () => {
    const app = await repo.create(userId, {
      title: "Backend Engineer",
      company: "Revision Corp",
      url: null,
    });

    const note = await repo.createNote(userId, {
      applicationId: app.id,
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    });

    const staleUpdate = await repo.updateNoteWithRevision(
      note.id,
      userId,
      note.revision + 1,
      {
        content: "Outdated write",
      },
    );
    expect(staleUpdate).toBeNull();

    const validUpdate = await repo.updateNoteWithRevision(
      note.id,
      userId,
      note.revision,
      {
        content: "Updated with valid revision",
      },
    );
    expect(validUpdate).not.toBeNull();
    expect(validUpdate?.revision).toBe(note.revision + 1);
    expect(validUpdate?.content).toBe("Updated with valid revision");
    expect(validUpdate?.applicationId).toBe(app.id);
  });

  it("returns application notes in desc order", async () => {
    const app = await repo.create(userId, {
      title: "Notes Timeline",
      company: "Order Corp",
      url: null,
    });

    const notesRepo = dataSource.getRepository(ApplicationNoteEntity);
    await notesRepo.save(
      notesRepo.create({
        applicationId: app.id,
        userId,
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "older" }] },
          ],
        }),
        createdAt: new Date("2030-01-01T09:00:00.000Z"),
        updatedAt: new Date("2030-01-01T09:00:00.000Z"),
      }),
    );
    await notesRepo.save(
      notesRepo.create({
        applicationId: app.id,
        userId,
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "newer" }] },
          ],
        }),
        createdAt: new Date("2030-01-01T10:00:00.000Z"),
        updatedAt: new Date("2030-01-01T10:00:00.000Z"),
      }),
    );

    const ordered = await repo.findNotesByApplicationIdAndUserId(
      app.id,
      userId,
    );

    expect(ordered).toHaveLength(2);
    expect(ordered.map((n) => n.content)).toEqual([
      JSON.stringify({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "newer" }] },
        ],
      }),
      JSON.stringify({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "older" }] },
        ],
      }),
    ]);
  });
});
