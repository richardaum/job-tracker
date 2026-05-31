import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { NoteRepository } from "./notes.repository";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("NoteRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: NoteRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new NoteRepository(
      dataSource.getRepository(JobEntity),
      dataSource.getRepository(JobNoteEntity),
    );

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-note-repo-test",
      email: "noterepo@example.com",
      name: "Note Repo User",
      avatarUrl: null,
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE companies, job_notes, job_stage_events, jobs, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  async function createTestApplication(uId: string, companyName: string) {
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const company = await companyRepo.save(companyRepo.create({ userId: uId, name: companyName }));
    const appRepo = dataSource.getRepository(JobEntity);
    return appRepo.save(
      appRepo.create({
        userId: uId,
        title: "Backend Engineer",
        companyId: company.id,
        urls: [],
      }),
    );
  }

  it("hasJob returns true for owned app", async () => {
    const app = await createTestApplication(userId, "Owned Corp");
    const hasApp = await repo.hasJob(app.id, userId);
    expect(hasApp).toBe(true);
  });

  it("hasJob returns false for non-owned app", async () => {
    const app = await createTestApplication(userId, "Hidden Corp");
    const hasApp = await repo.hasJob(app.id, "wrong-user-id");
    expect(hasApp).toBe(false);
  });

  it("enforces note revision checks on update", async () => {
    const app = await createTestApplication(userId, "Revision Corp");
    const note = await repo.create(userId, {
      jobId: app.id,
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    });

    const staleUpdate = await repo.updateWithRevision(note.id, userId, note.revision + 1, {
      content: "Outdated write",
    });
    expect(staleUpdate).toBeNull();

    const validUpdate = await repo.updateWithRevision(note.id, userId, note.revision, {
      content: "Updated with valid revision",
    });
    expect(validUpdate).not.toBeNull();
    expect(validUpdate?.revision).toBe(note.revision + 1);
    expect(validUpdate?.content).toBe("Updated with valid revision");
  });

  it("returns job notes in desc order", async () => {
    const app = await createTestApplication(userId, "Order Corp");
    const notesRepo = dataSource.getRepository(JobNoteEntity);
    await notesRepo.save(
      notesRepo.create({
        jobId: app.id,
        userId,
        content: "older",
        createdAt: new Date("2030-01-01T09:00:00.000Z"),
        updatedAt: new Date("2030-01-01T09:00:00.000Z"),
      }),
    );
    await notesRepo.save(
      notesRepo.create({
        jobId: app.id,
        userId,
        content: "newer",
        createdAt: new Date("2030-01-01T10:00:00.000Z"),
        updatedAt: new Date("2030-01-01T10:00:00.000Z"),
      }),
    );

    const ordered = await repo.findByJobIdAndUserId(app.id, userId);
    expect(ordered).toHaveLength(2);
    expect(ordered.map((n) => n.content)).toEqual(["newer", "older"]);
  });

  it("delete removes and returns note", async () => {
    const app = await createTestApplication(userId, "Delete Corp");
    const note = await repo.create(userId, {
      jobId: app.id,
      content: "to-delete",
    });

    const deleted = await repo.delete(note.id, userId);
    expect(deleted?.id).toBe(note.id);

    const missing = await repo.findByIdAndUserId(note.id, userId);
    expect(missing).toBeNull();
  });
});
