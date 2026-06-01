import { JobEntity } from "@api/database/entities/job.entity";
import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { MatchAnalysisRepository } from "@api/domains/match-analysis/match-analysis.repository";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("MatchAnalysisRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: MatchAnalysisRepository;
  let userId: string;
  let entitiesRepo: ReturnType<DataSource["getRepository"]>;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new MatchAnalysisRepository(dataSource.getRepository(MatchAnalysisEntity));
    entitiesRepo = dataSource.getRepository(MatchAnalysisEntity);

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-match-repo-test",
      email: "matchrepo@example.com",
      name: "Match Repo User",
      avatarUrl: null,
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query("TRUNCATE match_analysis, resumes, jobs, users CASCADE");
      await dataSource.destroy();
    }
  });

  async function ensureJob(jobId: string, ownerId = userId) {
    const jobsRepo = dataSource.getRepository(JobEntity);
    const existing = await jobsRepo.findOneBy({ id: jobId });
    if (!existing) {
      await jobsRepo.save(jobsRepo.create({ id: jobId, userId: ownerId, stage: "NEW" as never, urls: [], tags: [] }));
    }
  }

  async function insertMatch(overrides?: Record<string, unknown>) {
    const resumeId = "res-1";
    const resumesRepo = dataSource.getRepository(ResumeEntity);
    const existing = await resumesRepo.findOneBy({ id: resumeId });
    if (!existing) {
      await resumesRepo.save(resumesRepo.create({ id: resumeId, userId, title: "Test Resume" }));
    }

    return entitiesRepo.save(
      entitiesRepo.create({
        id: overrides?.id ?? undefined,
        jobId: overrides?.jobId ?? "job-x",
        userId,
        resumeId,
        items: [],
        matchCount: 0,
        gapCount: 0,
        unclearCount: 0,
        ...overrides,
      }),
    );
  }

  beforeEach(async () => {
    await dataSource.query("TRUNCATE match_analysis CASCADE");
  });

  describe("findByJobId", () => {
    it("returns match for a job owned by the user", async () => {
      await ensureJob("job-test-find");
      await insertMatch({ jobId: "job-test-find" });

      const result = await repo.findByJobId("job-test-find", userId);

      expect(result).not.toBeNull();
      expect(result!.jobId).toBe("job-test-find");
    });

    it("returns null for nonexistent job", async () => {
      const result = await repo.findByJobId("ghost", userId);
      expect(result).toBeNull();
    });

    it("returns null when job exists but belongs to different user", async () => {
      await ensureJob("job-other-user");
      await insertMatch({ jobId: "job-other-user" });

      const result = await repo.findByJobId("job-other-user", "other-user");

      expect(result).toBeNull();
    });
  });

  describe("findAllByUserId", () => {
    it("returns all matches for the user ordered by updatedAt DESC", async () => {
      await ensureJob("job-1");
      await ensureJob("job-2");
      const old = await insertMatch({ id: "match-old", jobId: "job-1", updatedAt: new Date("2026-01-01") });
      const recent = await insertMatch({ id: "match-recent", jobId: "job-2", updatedAt: new Date("2026-06-01") });

      const result = await repo.findAllByUserId(userId);

      expect(result.map((m) => m.id)).toEqual([recent.id, old.id]);
    });

    it("returns empty array for user with no matches", async () => {
      const result = await repo.findAllByUserId("nonexistent");
      expect(result).toEqual([]);
    });
  });
});
