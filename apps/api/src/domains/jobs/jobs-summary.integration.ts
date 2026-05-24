import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { JobsRepository } from "./jobs.repository";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("Job async summary metadata (integration)", () => {
  let dataSource: DataSource;
  let repo: JobsRepository;
  let asyncMetadataRepo: JobAsyncMetadataRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const jobsRepository = dataSource.getRepository(JobEntity);
    repo = new JobsRepository(jobsRepository);
    asyncMetadataRepo = new JobAsyncMetadataRepository(jobsRepository);

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-summary-metadata-test",
        email: "summarymeta@example.com",
        name: "Summary Meta User",
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

  async function createJob(title: string) {
    const company = await createCompany(title + " Corp");
    return repo.create(userId, { title, companyId: company.id, urls: [] });
  }

  describe("updateCas summary — transitions", () => {
    it("NULL → PROCESSING (first transition)", async () => {
      const job = await createJob("Summary First");
      const row = await dataSource.query(
        `SELECT summary_status FROM jobs WHERE id = $1`,
        [job.id],
      );
      expect(row[0].summary_status).toBeNull();

      const ok = await asyncMetadataRepo.updateCas(
        "summary",
        job.id,
        userId,
        null,
        { status: AsyncMetadataStatusEnum.PROCESSING },
      );
      expect(ok).toBe(true);

      const updated = await dataSource.query(
        `SELECT summary_status, summary_error FROM jobs WHERE id = $1`,
        [job.id],
      );
      expect(updated[0].summary_status).toBe(
        AsyncMetadataStatusEnum.PROCESSING,
      );
      expect(updated[0].summary_error).toBeNull();
    });

    it("PROCESSING → COMPLETED", async () => {
      const job = await createJob("Summary Completed");
      await dataSource.query(
        `UPDATE jobs SET summary_status = $1 WHERE id = $2`,
        [AsyncMetadataStatusEnum.PROCESSING, job.id],
      );

      const now = new Date();
      const ok = await asyncMetadataRepo.updateCas(
        "summary",
        job.id,
        userId,
        { status: AsyncMetadataStatusEnum.PROCESSING },
        { status: AsyncMetadataStatusEnum.COMPLETED, timestamp: now },
      );
      expect(ok).toBe(true);

      const updated = await dataSource.query(
        `SELECT summary_status, summary_timestamp FROM jobs WHERE id = $1`,
        [job.id],
      );
      expect(updated[0].summary_status).toBe(AsyncMetadataStatusEnum.COMPLETED);
    });

    it("PROCESSING → FAILED with error", async () => {
      const job = await createJob("Summary Failed");
      await dataSource.query(
        `UPDATE jobs SET summary_status = $1 WHERE id = $2`,
        [AsyncMetadataStatusEnum.PROCESSING, job.id],
      );

      const ok = await asyncMetadataRepo.updateCas(
        "summary",
        job.id,
        userId,
        { status: AsyncMetadataStatusEnum.PROCESSING },
        {
          status: AsyncMetadataStatusEnum.FAILED,
          error: "AI service unavailable",
          timestamp: new Date(),
        },
      );
      expect(ok).toBe(true);

      const updated = await dataSource.query(
        `SELECT summary_status, summary_error FROM jobs WHERE id = $1`,
        [job.id],
      );
      expect(updated[0].summary_status).toBe(AsyncMetadataStatusEnum.FAILED);
      expect(updated[0].summary_error).toBe("AI service unavailable");
    });

    it("rejects when expected status does not match (race condition)", async () => {
      const job = await createJob("Summary Race");
      await dataSource.query(
        `UPDATE jobs SET summary_status = $1 WHERE id = $2`,
        [AsyncMetadataStatusEnum.COMPLETED, job.id],
      );

      const ok = await asyncMetadataRepo.updateCas(
        "summary",
        job.id,
        userId,
        { status: AsyncMetadataStatusEnum.PROCESSING },
        { status: AsyncMetadataStatusEnum.COMPLETED },
      );
      expect(ok).toBe(false);
    });

    it("rejects when another user tries to update", async () => {
      const job = await createJob("Summary Wrong User");

      const ok = await asyncMetadataRepo.updateCas(
        "summary",
        job.id,
        "wrong-user-id",
        null,
        { status: AsyncMetadataStatusEnum.PROCESSING },
      );
      expect(ok).toBe(false);
    });
  });

  describe("resetStaleSummaryProcessing", () => {
    it("resets PROCESSING → FAILED, ignores others", async () => {
      await dataSource.query(
        "TRUNCATE jobs, job_stage_events, companies CASCADE",
      );

      const job1 = await createJob("Stale Summary 1");
      const job2 = await createJob("Stale Summary 2");
      const job3 = await createJob("Stale Summary 3");

      await dataSource.query(
        `UPDATE jobs SET summary_status = $1 WHERE id = $2`,
        [AsyncMetadataStatusEnum.PROCESSING, job1.id],
      );
      await dataSource.query(
        `UPDATE jobs SET summary_status = $1 WHERE id = $2`,
        [AsyncMetadataStatusEnum.PROCESSING, job2.id],
      );
      await dataSource.query(
        `UPDATE jobs SET summary_status = $1 WHERE id = $2`,
        [AsyncMetadataStatusEnum.COMPLETED, job3.id],
      );

      const count = await asyncMetadataRepo.resetStaleSummaryProcessing();
      expect(count).toBe(2);

      const rows: Array<{
        id: string;
        summary_status: string;
        summary_error: string | null;
      }> = await dataSource.query(
        `SELECT id, summary_status, summary_error FROM jobs WHERE id IN ($1, $2, $3)`,
        [job1.id, job2.id, job3.id],
      );

      const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
      expect(byId[job1.id].summary_status).toBe(AsyncMetadataStatusEnum.FAILED);
      expect(byId[job1.id].summary_error).toBeTruthy();
      expect(byId[job2.id].summary_status).toBe(AsyncMetadataStatusEnum.FAILED);
      expect(byId[job3.id].summary_status).toBe(
        AsyncMetadataStatusEnum.COMPLETED,
      );
    });
  });
});
