import { PlanEntity } from "@api/database/entities/plan.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { SourcesRepository } from "@api/domains/sources/sources.repository";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("SourcesRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: SourcesRepository;
  let userId: string;
  let planId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new SourcesRepository(
      dataSource.getRepository(SourceRunEntity),
      dataSource.getRepository(SourceTemplateEntity),
    );

    const user = await insertUserWithAuthAccount(dataSource, {
      providerAccountId: "google-sources-repo-test",
      email: "sourcesrepo@example.com",
      name: "Sources Repo User",
      avatarUrl: null,
    });
    userId = user.id;

    const plans = dataSource.getRepository(PlanEntity);
    const plan = await plans.save(
      plans.create({
        displayName: "Test Sources Repo",
        document: { steps: [] },
      }),
    );
    planId = plan.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE source_runs, source_templates, plans, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.query("TRUNCATE source_runs, source_templates CASCADE");
  });

  it("findRunsForTemplate returns runs newest-started first", async () => {
    const templates = dataSource.getRepository(SourceTemplateEntity);
    const template = await templates.save(
      templates.create({
        userId,
        planId,
        surfaceUrl: "https://example.com/initial",
        scheduleEnabled: false,
        scheduleCron: null,
      }),
    );

    const older = await repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.Completed,
      startedAt: new Date("2026-05-01T10:00:00.000Z"),
      surfaceUrl: "https://example.com/surface",
    });
    const newer = await repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.Completed,
      startedAt: new Date("2026-05-02T10:00:00.000Z"),
      surfaceUrl: "https://example.com/surface",
    });

    const runs = await repo.findRunsForTemplate({
      userId,
      templateId: template.id,
    });

    expect(runs.map((r) => r.id)).toEqual([newer.id, older.id]);
  });
});
