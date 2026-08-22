import { PlanEntity } from "@api/database/entities/plan.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { insertIntegrationUser } from "@api/database/integration-test-user";
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

    const user = await insertIntegrationUser(dataSource, {
      email: "sourcesrepo@example.com",
      name: "Sources Repo User",
      avatarUrl: null,
    });
    userId = user.id;

    const plans = dataSource.getRepository(PlanEntity);
    const plan = await plans.save(plans.create({ displayName: "Test Sources Repo", document: { steps: [] }, userId }));
    planId = plan.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query("TRUNCATE source_runs, source_templates, plans, users CASCADE");
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

    const runs = await repo.findRunsForTemplate({ userId, templateId: template.id });

    expect(runs.map((r) => r.id)).toEqual([newer.id, older.id]);
  });

  it("listTemplatesByUserAndPlanId returns templates for a plan", async () => {
    const plans = dataSource.getRepository(PlanEntity);
    const planB = await plans.save(plans.create({ displayName: "Plan B", document: { steps: [] }, userId }));

    const templates = dataSource.getRepository(SourceTemplateEntity);
    await templates.save(
      templates.create({
        userId,
        planId,
        surfaceUrl: "https://example.com/planA",
        scheduleEnabled: false,
        scheduleCron: null,
      }),
    );
    await templates.save(
      templates.create({
        userId,
        planId: planB.id,
        surfaceUrl: "https://example.com/planB",
        scheduleEnabled: false,
        scheduleCron: null,
      }),
    );

    const result = await repo.listTemplatesByUserAndPlanId(userId, planId);

    expect(result).toHaveLength(1);
    expect(result[0].surfaceUrl).toBe("https://example.com/planA");
  });

  it("listTemplatesByUserAndPlanId returns empty for unknown plan", async () => {
    const result = await repo.listTemplatesByUserAndPlanId(userId, "00000000-0000-0000-0000-000000000000");

    expect(result).toEqual([]);
  });

  it("deleteRunsByTemplateId removes runs and returns count", async () => {
    const templates = dataSource.getRepository(SourceTemplateEntity);
    const template = await templates.save(
      templates.create({
        userId,
        planId,
        surfaceUrl: "https://example.com/todelete",
        scheduleEnabled: false,
        scheduleCron: null,
      }),
    );

    const runRepo = dataSource.getRepository(SourceRunEntity);
    await runRepo.save(
      runRepo.create({
        userId,
        templateId: template.id,
        surfaceUrl: "https://example.com/r1",
        status: SourceRunStatusEnum.Completed,
        startedAt: new Date(),
      }),
    );
    await runRepo.save(
      runRepo.create({
        userId,
        templateId: template.id,
        surfaceUrl: "https://example.com/r2",
        status: SourceRunStatusEnum.Completed,
        startedAt: new Date(),
      }),
    );

    const count = await repo.deleteRunsByTemplateId({ userId, templateId: template.id });

    expect(count).toBe(2);

    const remaining = await runRepo.find({ where: { userId, templateId: template.id } });
    expect(remaining).toEqual([]);
  });
});
