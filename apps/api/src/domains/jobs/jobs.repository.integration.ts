import { JobEntity } from "@api/database/entities/job.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("JobsRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: JobsRepository;
  let userId: string;
  let jobsRepo: ReturnType<DataSource["getRepository"]>;
  let sourceRunsRepo: ReturnType<DataSource["getRepository"]>;
  let dummyTemplateId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new JobsRepository(dataSource.getRepository(JobEntity));
    jobsRepo = dataSource.getRepository(JobEntity);
    sourceRunsRepo = dataSource.getRepository(SourceRunEntity);

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-jobs-repo-test",
      email: "jobsrepo@example.com",
      name: "Jobs Repo User",
      avatarUrl: null,
    });
    userId = user.id;

    const [{ id }] = await dataSource.query(
      `INSERT INTO plans (display_name, document) VALUES ('Jobs Repo Plan', '{"steps":[]}'::jsonb) RETURNING id`,
    );
    const [{ id: tid }] = await dataSource.query(
      `INSERT INTO source_templates (id, user_id, plan_id, surface_url, schedule_enabled)
       VALUES (gen_random_uuid(), $1, $2, 'https://example.com/tmpl', false) RETURNING id`,
      [userId, id],
    );
    dummyTemplateId = tid;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query("TRUNCATE source_runs, jobs, users CASCADE");
      await dataSource.destroy();
    }
  });

  async function ensureSourceRun(runId: string) {
    const existing = await sourceRunsRepo.findOneBy({ id: runId });
    if (!existing) {
      await dataSource.query(
        `INSERT INTO source_runs (id, user_id, template_id, surface_url, status, started_at)
         VALUES ($1, $2, $3, 'https://example.com', 'Completed', NOW())`,
        [runId, userId, dummyTemplateId],
      );
    }
  }

  async function insertJob(overrides?: Record<string, unknown>) {
    return jobsRepo.save(
      jobsRepo.create({
        id: overrides?.id ?? undefined,
        userId,
        stage: ApplicationStageEnum.NEW,
        urls: [],
        tags: [],
        ...overrides,
      }),
    );
  }

  describe("countBySourceRunIds", () => {
    beforeEach(async () => {
      await ensureSourceRun("run-a");
      await ensureSourceRun("run-b");
    });

    it("returns counts grouped by sourceRunId", async () => {
      await insertJob({ title: "A", sourceRunId: "run-a" });
      await insertJob({ title: "B", sourceRunId: "run-a" });
      await insertJob({ title: "C", sourceRunId: "run-b" });

      const result = await repo.countBySourceRunIds(userId, [
        "run-a",
        "run-b",
        "run-nonexistent",
      ]);

      expect(result.get("run-a")).toBe(2);
      expect(result.get("run-b")).toBe(1);
      expect(result.has("run-nonexistent")).toBe(false);
    });

    it("returns empty map for empty ids", async () => {
      const result = await repo.countBySourceRunIds(userId, []);
      expect(result.size).toBe(0);
    });

    it("returns empty map for unknown run ids", async () => {
      const result = await repo.countBySourceRunIds(userId, ["ghost"]);
      expect(result.size).toBe(0);
    });
  });

  describe("deleteBySourceRunId", () => {
    beforeEach(async () => {
      await ensureSourceRun("run-del");
      await ensureSourceRun("run-keep");
    });

    it("deletes all jobs for a given sourceRunId", async () => {
      await insertJob({ title: "X", sourceRunId: "run-del" });
      await insertJob({ title: "Y", sourceRunId: "run-del" });
      await insertJob({ title: "Z", sourceRunId: "run-keep" });

      const deleted = await repo.deleteBySourceRunId("run-del", userId);

      expect(deleted).toBe(2);

      const remaining = await jobsRepo.find({
        where: { userId, sourceRunId: "run-keep" },
      });
      expect(remaining).toHaveLength(1);
    });

    it("returns 0 when no jobs match", async () => {
      const deleted = await repo.deleteBySourceRunId("nonexistent", userId);
      expect(deleted).toBe(0);
    });
  });
});
