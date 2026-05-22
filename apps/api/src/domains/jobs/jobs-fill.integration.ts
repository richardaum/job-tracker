import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { JobsRepository } from "./jobs.repository";

const hasDb = !!process.env.DATABASE_E2E_URL;

describe.skipIf(!hasDb)("JobsRepository — fill metadata (integration)", () => {
  let dataSource: DataSource;
  let repo: JobsRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new JobsRepository(
      dataSource.getRepository(JobEntity),
      dataSource.getRepository(JobStageEventEntity),
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

  it("beginFillAutomatically → completeFillAutomatically CAS on fill_status", async () => {
    const company = await createCompany("Fill CAS Co");
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

    const done = await repo.completeFillAutomatically(job.id, userId);
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
