import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { JobAutomaticFillService } from "./job-automatic-fill.service";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";
import { SalaryService } from "./salary/salary.service";
import { TagService } from "./tags/tag.service";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("Job async fill metadata (integration)", () => {
  let dataSource: DataSource;
  let repo: JobsRepository;
  let stageEventsRepo: JobStageEventsRepository;
  let fillService: JobAutomaticFillService;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const jobsRepository = dataSource.getRepository(JobEntity);
    repo = new JobsRepository(jobsRepository);
    stageEventsRepo = new JobStageEventsRepository(
      dataSource.getRepository(JobStageEventEntity),
    );

    const draftExtractionService = {
      extract: vi
        .fn()
        .mockResolvedValue({
          title: "Filled atomically",
          company: "Tx Atomic Draft Co",
          url: null,
          description: "",
          salary: { min: null, max: null, currency: null, period: null },
          tags: ["from-tx"],
          location: null,
          workRegion: null,
        }),
    } as never;

    const draftExtractionNormalizationService = {
      normalizeExtraction: vi
        .fn()
        .mockReturnValue({
          title: "Filled atomically",
          company: "Tx Atomic Draft Co",
          description: null,
          salary: {
            minCents: null,
            maxCents: null,
            currency: null,
            period: null,
          },
          tags: ["from-tx"],
          location: null,
          workRegion: null,
        }),
    } as never;

    const companyService = {
      findOrCreateByName: vi.fn(async (uid: string, name: string) => {
        const companyRepo = dataSource.getRepository(CompanyEntity);
        const existing = await companyRepo.findOne({
          where: { userId: uid, name },
        });
        if (existing) return existing;
        return companyRepo.save(companyRepo.create({ userId: uid, name }));
      }),
    } as never;

    fillService = new JobAutomaticFillService(
      dataSource,
      repo,
      stageEventsRepo,
      { findOne: vi.fn() } as never,
      companyService,
      new SalaryService(),
      new TagService(),
      draftExtractionService,
      draftExtractionNormalizationService,
      { emit: vi.fn() } as never,
    );

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-fill-metadata-integration",
      email: "fillmeta@example.com",
      name: "Fill Metadata User",
      avatarUrl: null,
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE companies, jobs, job_stage_events, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  async function createCompany(name: string) {
    const companyRepo = dataSource.getRepository(CompanyEntity);
    return companyRepo.save(companyRepo.create({ userId, name }));
  }

  it("beginFillAutomatically → updateFillMetadataIfStatus COMPLETED on fill_status", async () => {
    const company = await createCompany("Fill Status Co");
    const job = await repo.create(userId, {
      title: "T",
      companyId: company.id,
      urls: [],
    });

    const started = await repo.beginFillAutomaticallyProcessing(job.id, userId);
    expect(started).toBe(true);

    const rows = (await dataSource.query(
      `SELECT fill_status FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ fill_status: string }>;
    expect(rows[0]?.fill_status).toBe(
      AsyncMetadataStatusEnum.PROCESSING as string,
    );

    const done = await repo.updateFillMetadataIfStatus(
      job.id,
      userId,
      AsyncMetadataStatusEnum.PROCESSING,
      {
        status: AsyncMetadataStatusEnum.COMPLETED,
        timestamp: new Date(),
        error: null,
      },
    );
    expect(done).toBe(true);

    const after = (await dataSource.query(
      `SELECT fill_status, fill_error FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ fill_status: string; fill_error: string | null }>;
    expect(after[0]?.fill_status).toBe(
      AsyncMetadataStatusEnum.COMPLETED as string,
    );
    expect(after[0]?.fill_error).toBeNull();
  });

  it("processFillJob promotes DRAFT→NEW, inserts event, completes fill metadata", async () => {
    const company = await createCompany("Tx Atomic Draft Co");
    const job = await repo.create(userId, {
      title: "Drafty",
      companyId: company.id,
      urls: [],
      htmlContent: "<p>posting</p>",
    });

    await dataSource
      .getRepository(JobEntity)
      .update({ id: job.id, userId }, { stage: ApplicationStageEnum.DRAFT });

    await stageEventsRepo.createStageEvent(userId, job.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.DRAFT,
      source: undefined,
      reason: null,
      scheduledAt: null,
    });

    await repo.beginFillAutomaticallyProcessing(job.id, userId);

    await fillService.processFillJob(userId, job.id);

    const jrow = (await dataSource.query(
      `SELECT stage::text FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ stage: string }>;
    expect(jrow[0]?.stage).toBe(ApplicationStageEnum.NEW);

    const fills = (await dataSource.query(
      `SELECT fill_status FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ fill_status: string }>;
    expect(fills[0]?.fill_status).toBe(
      AsyncMetadataStatusEnum.COMPLETED as string,
    );

    const evCount = (await dataSource.query(
      `SELECT count(*)::text as c FROM job_stage_events WHERE job_id = $1 AND user_id = $2`,
      [job.id, userId],
    )) as Array<{ c: string }>;
    expect(Number(evCount[0]?.c ?? "0")).toBeGreaterThanOrEqual(2);
  });

  it("resetStaleFillProcessing resets PROCESSING rows", async () => {
    const company = await createCompany("Stale Fill Co");
    const job = await repo.create(userId, {
      title: "Stale",
      companyId: company.id,
      urls: [],
    });
    await repo.beginFillAutomaticallyProcessing(job.id, userId);

    const n = await repo.resetStaleFillProcessing();
    expect(n).toBeGreaterThanOrEqual(1);

    const row = (await dataSource.query(
      `SELECT fill_status FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ fill_status: string }>;
    expect(row[0]?.fill_status).toBe(AsyncMetadataStatusEnum.FAILED as string);
  });
});
