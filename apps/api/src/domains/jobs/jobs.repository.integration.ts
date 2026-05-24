import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { CompanyRepository } from "@api/domains/companies/companies.repository";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";
import { JobsListQuery } from "./jobs-list.query";
import { StageEventSourceEnum } from "./stage-event-source.enum";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("Jobs domain persistence (integration)", () => {
  let dataSource: DataSource;
  let repo: JobsRepository;
  let listQuery: JobsListQuery;
  let stageEventsRepo: JobStageEventsRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const jobsRepository = dataSource.getRepository(JobEntity);
    repo = new JobsRepository(jobsRepository);
    listQuery = new JobsListQuery(jobsRepository);
    stageEventsRepo = new JobStageEventsRepository(
      dataSource.getRepository(JobStageEventEntity),
    );

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-app-repo-test",
      email: "apprepo@example.com",
      name: "App Repo User",
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

  async function createTestCompany(uId: string, name: string) {
    const companyRepo = dataSource.getRepository(CompanyEntity);
    return companyRepo.save(companyRepo.create({ userId: uId, name }));
  }

  it("findAllByUserId returns empty array when no applications", async () => {
    const result = await listQuery.findAllByUserId(userId);
    expect(result).toEqual([]);
  });

  it("create inserts a new job", async () => {
    const company = await createTestCompany(userId, "Acme Corp");
    const app = await repo.create(userId, {
      title: "Software Engineer",
      companyId: company.id,
      urls: ["https://acme.com/jobs/1"],
    });
    expect(app.id).toBeDefined();
    expect(app.userId).toBe(userId);
    expect(app.title).toBe("Software Engineer");
    expect(app.companyId).toBe(company.id);
  });

  it("findAllByUserId returns only the user's applications", async () => {
    const result = await listQuery.findAllByUserId(userId);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Software Engineer");
    expect(result[0].company).toBeDefined();
    expect(result[0].company!.name).toBe("Acme Corp");
  });

  it("findOneByIdAndUserId returns job when owner matches", async () => {
    const [app] = await listQuery.findAllByUserId(userId);
    const found = await repo.findOneByIdAndUserId(app.id, userId);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(app.id);
    expect(found?.company).toBeDefined();
    expect(found?.company!.name).toBe("Acme Corp");
  });

  it("findOneByIdAndUserId returns null when owner does not match", async () => {
    const [app] = await listQuery.findAllByUserId(userId);
    const found = await repo.findOneByIdAndUserId(app.id, "wrong-user-id");
    expect(found).toBeNull();
  });

  it("update modifies the job", async () => {
    const [app] = await listQuery.findAllByUserId(userId);
    const updated = await repo.update(app.id, userId, {
      title: "Senior Engineer",
    });
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Senior Engineer");
  });

  it("delete removes the job", async () => {
    const [app] = await listQuery.findAllByUserId(userId);
    const deleted = await repo.delete(app.id, userId);
    expect(deleted).not.toBeNull();
    const remaining = await listQuery.findAllByUserId(userId);
    expect(remaining).toHaveLength(0);
  });

  it("findAllByUserId does not return other users' applications", async () => {
    const otherUser = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-other-user",
      email: "other@example.com",
      name: "Other User",
      avatarUrl: null,
    });

    const otherCompany = await createTestCompany(otherUser.id, "Other Corp");
    await repo.create(otherUser.id, {
      title: "Other User's Job",
      companyId: otherCompany.id,
      urls: [],
    });

    const result = await listQuery.findAllByUserId(userId);
    expect(result.every((a) => a.userId === userId)).toBe(true);
  });

  it("stores and returns stage events in desc order using scheduledAt fallback createdAt", async () => {
    const company = await createTestCompany(userId, "Timeline Corp");
    const app = await repo.create(userId, {
      title: "Platform Engineer",
      companyId: company.id,
      urls: [],
    });

    const first = await stageEventsRepo.createStageEvent(userId, app.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.APPLIED,
      source: StageEventSourceEnum.Manual,
      scheduledAt: new Date("2030-01-01T09:00:00.000Z"),
    });
    const second = await stageEventsRepo.createStageEvent(userId, app.id, {
      fromStage: ApplicationStageEnum.APPLIED,
      toStage: ApplicationStageEnum.TECHNICAL,
      source: StageEventSourceEnum.Manual,
      scheduledAt: null,
    });

    const events = await stageEventsRepo.findStageEventsByJobIdAndUserId(
      app.id,
      userId,
    );
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe(first.id);
    expect(events[0].toStage).toBe(ApplicationStageEnum.APPLIED);
    expect(events[1].id).toBe(second.id);
    expect(events[1].fromStage).toBe(ApplicationStageEnum.APPLIED);
    expect(events[1].toStage).toBe(ApplicationStageEnum.TECHNICAL);
  });

  it("active quick filter excludes applied stage", async () => {
    const company = await createTestCompany(userId, "Quick Filter Corp");

    const appliedApp = await repo.create(userId, {
      title: "Applied App",
      companyId: company.id,
      urls: [],
    });
    await stageEventsRepo.createStageEvent(userId, appliedApp.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.APPLIED,
      source: StageEventSourceEnum.Manual,
      scheduledAt: null,
    });

    const activeApp = await repo.create(userId, {
      title: "Active App",
      companyId: company.id,
      urls: [],
    });
    await stageEventsRepo.createStageEvent(userId, activeApp.id, {
      fromStage: ApplicationStageEnum.APPLIED,
      toStage: ApplicationStageEnum.TECHNICAL,
      source: StageEventSourceEnum.Manual,
      scheduledAt: null,
    });

    const active = await listQuery.findAllByUserId(
      userId,
      ApplicationQuickFilterEnum.ACTIVE,
    );

    expect(active.map((app) => app.id)).toContain(activeApp.id);
    expect(active.map((app) => app.id)).not.toContain(appliedApp.id);
  });

  it("incoming quick filter excludes applied stage even with future events", async () => {
    const company = await createTestCompany(userId, "Incoming Filter Corp");

    const appliedAppWithEvent = await repo.create(userId, {
      title: "Applied App With Event",
      companyId: company.id,
      urls: [],
    });
    await stageEventsRepo.createStageEvent(userId, appliedAppWithEvent.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.APPLIED,
      source: StageEventSourceEnum.Manual,
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    });

    const recruiterScreenApp = await repo.create(userId, {
      title: "Recruiter Screen App",
      companyId: company.id,
      urls: [],
    });
    await stageEventsRepo.createStageEvent(userId, recruiterScreenApp.id, {
      fromStage: ApplicationStageEnum.APPLIED,
      toStage: ApplicationStageEnum.RECRUITER_SCREEN,
      source: StageEventSourceEnum.Manual,
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    });

    const incoming = await listQuery.findAllByUserId(
      userId,
      ApplicationQuickFilterEnum.INCOMING,
    );

    expect(incoming.map((app) => app.id)).toContain(recruiterScreenApp.id);
    expect(incoming.map((app) => app.id)).not.toContain(appliedAppWithEvent.id);
  });

  it("new quick filter excludes duplicated latest stage", async () => {
    const company = await createTestCompany(userId, "New Vs Dup Corp");

    const newLatest = await repo.create(userId, {
      title: "New Latest",
      companyId: company.id,
      urls: [],
    });
    await stageEventsRepo.createStageEvent(userId, newLatest.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: StageEventSourceEnum.Manual,
      scheduledAt: null,
    });

    const dupLatest = await repo.create(userId, {
      title: "Dup Latest",
      companyId: company.id,
      urls: [],
    });
    await stageEventsRepo.createStageEvent(userId, dupLatest.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: StageEventSourceEnum.Manual,
      scheduledAt: null,
    });
    await stageEventsRepo.createStageEvent(userId, dupLatest.id, {
      fromStage: ApplicationStageEnum.NEW,
      toStage: ApplicationStageEnum.DUPLICATED,
      source: StageEventSourceEnum.System,
      scheduledAt: null,
    });

    const newFiltered = await listQuery.findAllByUserId(
      userId,
      ApplicationQuickFilterEnum.NEW,
    );
    const dupFiltered = await listQuery.findAllByUserId(
      userId,
      ApplicationQuickFilterEnum.DUPLICATED,
    );

    expect(newFiltered.map((a) => a.id)).toContain(newLatest.id);
    expect(newFiltered.map((a) => a.id)).not.toContain(dupLatest.id);
    expect(dupFiltered.map((a) => a.id)).toContain(dupLatest.id);
    expect(dupFiltered.map((a) => a.id)).not.toContain(newLatest.id);
  });

  it("filters applications by company name", async () => {
    const acme = await createTestCompany(userId, "Acme Filter Corp");
    const beta = await createTestCompany(userId, "Beta Filter Corp");

    const acmeApp = await repo.create(userId, {
      title: "Acme Role",
      companyId: acme.id,
      urls: [],
    });
    await repo.create(userId, {
      title: "Beta Role",
      companyId: beta.id,
      urls: [],
    });

    const filtered = await listQuery.findAllByUserId(
      userId,
      undefined,
      acme.name,
    );
    expect(filtered.map((app) => app.id)).toContain(acmeApp.id);
    expect(filtered.every((app) => app.company!.name === acme.name)).toBe(true);
  });

  it("findUpToTwoJobPostingContextsByCompanyName returns up to two recent descriptions", async () => {
    const company = await createTestCompany(userId, "Posting Snippet Co");
    const desc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Reliability tooling" }],
        },
      ],
    });

    const oldest = await repo.create(userId, {
      title: "Role Three",
      companyId: company.id,
      description: desc,
      urls: [],
    });
    await repo.create(userId, {
      title: "Role Two",
      companyId: company.id,
      description: desc,
      urls: [],
    });
    await repo.update(oldest.id, userId, { title: "Role Three bumped" });
    await repo.create(userId, {
      title: "Role One Empty",
      companyId: company.id,
      description: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
      urls: [],
    });

    const result = await listQuery.findUpToTwoJobPostingContextsByCompanyName(
      userId,
      "  posting snippet co ",
    );
    expect(result).toHaveLength(2);
    expect(result[0]?.title).toBe("Role Three bumped");
    expect(result[1]?.title).toBe("Role Two");
    expect(result.every((r) => r.plainTextDescription)).toBe(true);
  });

  it("persists htmlContent and isolates persisted DRAFT rows for DRAFT quick filter", async () => {
    const company = await createTestCompany(userId, "Draft Filter Corp");

    const capture = await repo.create(userId, {
      title: null,
      companyId: company.id,
      urls: ["https://import.example/from-extension"],
      description: null,
      htmlContent: "<html><body>captured</body></html>",
    });

    await repo.setPersistedStage(
      userId,
      capture.id,
      ApplicationStageEnum.DRAFT,
    );

    const normal = await repo.create(userId, {
      title: "Normal job",
      companyId: company.id,
      urls: [],
      description: null,
    });

    const reloaded = await repo.findOneByIdAndUserId(capture.id, userId);
    expect(reloaded?.htmlContent).toContain("captured");

    const draftsOnly = await listQuery.findAllByUserId(
      userId,
      ApplicationQuickFilterEnum.DRAFT,
    );
    expect(draftsOnly.map((j) => j.id)).toContain(capture.id);
    expect(draftsOnly.map((j) => j.id)).not.toContain(normal.id);
  });

  it("findOrCreateByName resolves case-insensitive matches under unique constraint", async () => {
    const companyRepo = new CompanyRepository(
      dataSource.getRepository(CompanyEntity),
      dataSource.getRepository(JobEntity),
    );
    const first = await companyRepo.findOrCreateByName(userId, "UniqueCo Intl");
    const second = await companyRepo.findOrCreateByName(
      userId,
      " UNIQUECO INTL ",
    );

    expect(second.id).toBe(first.id);
  });
});
