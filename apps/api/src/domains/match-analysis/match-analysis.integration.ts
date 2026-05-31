import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MatchAnalysisRepository } from "./match-analysis.repository";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("MatchAnalysisRepository — generation metadata (integration)", () => {
  let dataSource: DataSource;
  let repo: MatchAnalysisRepository;
  let userId: string;
  let resumeId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new MatchAnalysisRepository(dataSource.getRepository(MatchAnalysisEntity));

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-match-metadata-test",
      email: "matchmetadata@example.com",
      name: "Match Meta User",
      avatarUrl: null,
    });
    userId = user.id;

    const resumeRepo = dataSource.getRepository(ResumeEntity);
    const resume = await resumeRepo.save(
      resumeRepo.create({ userId, title: "Test Resume", isDefault: true }),
    );
    resumeId = resume.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query("TRUNCATE match_analysis, jobs, resumes, companies, users CASCADE");
      await dataSource.destroy();
    }
  });

  let jobCounter = 0;
  async function createJob() {
    jobCounter++;
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const company = await companyRepo.save(
      companyRepo.create({ userId, name: `Match Corp ${jobCounter}` }),
    );
    const jobRepo = dataSource.getRepository(JobEntity);
    return jobRepo.save(
      jobRepo.create({
        userId,
        title: `Match Test Job ${jobCounter}`,
        companyId: company.id,
        urls: [],
      }),
    );
  }

  async function createMatch(overrides?: Partial<MatchAnalysisEntity>) {
    const job = await createJob();
    const row = dataSource
      .getRepository(MatchAnalysisEntity)
      .create({ userId, resumeId, jobId: job.id, items: [], ...overrides });
    return dataSource.getRepository(MatchAnalysisEntity).save(row);
  }

  describe("generation_status column via raw SQL", () => {
    it("reads generation_status via snake_case column mapping", async () => {
      const match = await createMatch({
        generationMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date("2025-01-01"),
        },
      });

      const row = await dataSource.query(
        `SELECT generation_status, generation_error, generation_timestamp FROM match_analysis WHERE id = $1`,
        [match.id],
      );
      expect(row[0].generation_status).toBe(AsyncMetadataStatusEnum.PROCESSING);
      expect(row[0].generation_error).toBeNull();
      expect(row[0].generation_timestamp).toBeTruthy();
    });

    it("generation_status IS NULL for never-requested analysis", async () => {
      const job = await createJob();
      const row = dataSource
        .getRepository(MatchAnalysisEntity)
        .create({ userId, resumeId, jobId: job.id, items: [] });
      const saved = await dataSource.getRepository(MatchAnalysisEntity).save(row);

      const result = await dataSource.query(
        `SELECT generation_status FROM match_analysis WHERE id = $1`,
        [saved.id],
      );
      expect(result[0].generation_status).toBeNull();
    });
  });

  describe("updateById with expectedStatus", () => {
    it("updates when expectedStatus matches", async () => {
      const match = await createMatch({
        generationMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
      });

      const updated = await repo.updateById(
        match.id,
        AsyncMetadataStatusEnum.PROCESSING,
        {
          generationMetadata: {
            status: AsyncMetadataStatusEnum.COMPLETED,
            error: null,
            timestamp: new Date(),
          },
          scoreRatio: 0.85,
        },
        userId,
      );
      expect(updated).not.toBeNull();
      expect(updated?.generationMetadata?.status).toBe(AsyncMetadataStatusEnum.COMPLETED);
      expect(updated?.scoreRatio).toBe(0.85);
    });

    it("returns null when expectedStatus does not match", async () => {
      const match = await createMatch({
        generationMetadata: {
          status: AsyncMetadataStatusEnum.COMPLETED,
          error: null,
          timestamp: new Date(),
        },
      });

      const updated = await repo.updateById(
        match.id,
        AsyncMetadataStatusEnum.PROCESSING,
        {
          generationMetadata: {
            status: AsyncMetadataStatusEnum.FAILED,
            error: "stale update",
            timestamp: new Date(),
          },
        },
        userId,
      );
      expect(updated).toBeNull();

      const row = await dataSource.query(
        `SELECT generation_status FROM match_analysis WHERE id = $1`,
        [match.id],
      );
      expect(row[0].generation_status).toBe(AsyncMetadataStatusEnum.COMPLETED);
    });
  });

  describe("resetStaleProcessing", () => {
    it("resets PROCESSING → FAILED, ignores others", async () => {
      await dataSource.query("TRUNCATE match_analysis CASCADE");

      const m1 = await createMatch({
        generationMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
      });
      const m2 = await createMatch({
        generationMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
      });
      const m3 = await createMatch({
        generationMetadata: {
          status: AsyncMetadataStatusEnum.COMPLETED,
          error: null,
          timestamp: new Date(),
        },
      });

      const count = await repo.resetStaleProcessing();
      expect(count).toBe(2);

      const rows: Array<{
        id: string;
        generation_status: string;
        generation_error: string | null;
      }> = await dataSource.query(
        `SELECT id, generation_status, generation_error FROM match_analysis WHERE id IN ($1, $2, $3)`,
        [m1.id, m2.id, m3.id],
      );

      const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
      expect(byId[m1.id].generation_status).toBe(AsyncMetadataStatusEnum.FAILED);
      expect(byId[m1.id].generation_error).toBeTruthy();
      expect(byId[m2.id].generation_status).toBe(AsyncMetadataStatusEnum.FAILED);
      expect(byId[m3.id].generation_status).toBe(AsyncMetadataStatusEnum.COMPLETED);
    });
  });
});
