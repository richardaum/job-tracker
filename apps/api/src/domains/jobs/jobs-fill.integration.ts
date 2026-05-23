import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { serverEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { JobFillPersistence } from "./job-fill.persistence";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";

const hasDb = !!serverEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("Job async fill metadata (integration)", () => {
  let dataSource: DataSource;
  let repo: JobsRepository;
  let asyncMetadataRepo: JobAsyncMetadataRepository;
  let fillPersistence: JobFillPersistence;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const jobsRepository = dataSource.getRepository(JobEntity);
    repo = new JobsRepository(jobsRepository);
    asyncMetadataRepo = new JobAsyncMetadataRepository(jobsRepository);
    const stageEventsRepo = new JobStageEventsRepository(
      dataSource.getRepository(JobStageEventEntity),
    );
    fillPersistence = new JobFillPersistence(
      dataSource,
      repo,
      stageEventsRepo,
      asyncMetadataRepo,
    );

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-fill-metadata-integration",
        email: "fillmeta@example.com",
        name: "Fill Metadata User",
        avatarUrl: null,
        role: RoleEnum.User,
      }),
    );
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

  it("beginFillAutomatically → updateCas COMPLETED on fill_status", async () => {
    const company = await createCompany("Fill CAS Co");
    const job = await repo.create(userId, {
      title: "T",
      companyId: company.id,
      urls: [],
    });

    const started = await asyncMetadataRepo.beginFillAutomaticallyProcessing(
      job.id,
      userId,
    );
    expect(started).toBe(true);

    const rows = (await dataSource.query(
      `SELECT fill_status FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ fill_status: string }>;
    expect(rows[0]?.fill_status).toBe(
      AsyncMetadataStatusEnum.PROCESSING as string,
    );

    const done = await asyncMetadataRepo.updateCas(
      "fill",
      job.id,
      userId,
      { status: AsyncMetadataStatusEnum.PROCESSING },
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

  it("finalizeExtractedFill promotes DRAFT→NEW, inserts event, CAS-completes fill", async () => {
    const company = await createCompany("Tx Atomic Draft Co");
    const job = await repo.create(userId, {
      title: "Drafty",
      companyId: company.id,
      urls: [],
    });

    await dataSource
      .getRepository(JobEntity)
      .update({ id: job.id, userId }, { stage: ApplicationStageEnum.DRAFT });

    await asyncMetadataRepo.beginFillAutomaticallyProcessing(job.id, userId);

    const result = await fillPersistence.finalizeExtractedFill(
      job.id,
      userId,
      {
        title: "Filled atomically",
        companyId: company.id,
        description: null,
        tags: ["from-tx"],
        location: null,
        workRegion: null,
      },
      true,
    );
    expect(result).toEqual({ ok: true });

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
    expect(Number(evCount[0]?.c ?? "0")).toBeGreaterThanOrEqual(1);
  });

  it("resetStaleFillProcessing resets PROCESSING rows", async () => {
    const company = await createCompany("Stale Fill Co");
    const job = await repo.create(userId, {
      title: "Stale",
      companyId: company.id,
      urls: [],
    });
    await asyncMetadataRepo.beginFillAutomaticallyProcessing(job.id, userId);

    const n = await asyncMetadataRepo.resetStaleFillProcessing();
    expect(n).toBeGreaterThanOrEqual(1);

    const row = (await dataSource.query(
      `SELECT fill_status FROM jobs WHERE id = $1`,
      [job.id],
    )) as Array<{ fill_status: string }>;
    expect(row[0]?.fill_status).toBe(AsyncMetadataStatusEnum.FAILED as string);
  });
});
