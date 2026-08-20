import { ExtensionActivityEventEntity } from "@api/database/entities/extension-activity-event.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { SourcesRepository } from "./sources.repository";

function template(): SourceTemplateEntity {
  return {
    id: "template-1",
    userId: "user-1",
    planId: "plan-1",
    plan: { id: "plan-1" },
    scheduleCron: null,
    scheduleEnabled: false,
    surfaceUrl: "https://example.com/jobs",
    config: null,
    createdAt: new Date("2026-01-01"),
  } as SourceTemplateEntity;
}

function run(): SourceRunEntity {
  return {
    id: "run-1",
    userId: "user-1",
    templateId: "template-1",
    template: template(),
    surfaceUrl: "https://example.com/jobs",
    status: SourceRunStatusEnum.Pending,
    startedAt: new Date("2026-01-01"),
    errorMessage: null,
  } as SourceRunEntity;
}

describe("SourcesRepository", () => {
  let runsRepo: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    manager: { createQueryBuilder: ReturnType<typeof vi.fn> };
  };
  let templatesRepo: Record<string, ReturnType<typeof vi.fn>>;
  let repo: SourcesRepository;

  beforeEach(() => {
    runsRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      manager: { createQueryBuilder: vi.fn() },
    };
    templatesRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };
    repo = new SourcesRepository(
      runsRepo as unknown as Repository<SourceRunEntity>,
      templatesRepo as unknown as Repository<SourceTemplateEntity>,
    );
  });

  it("lists templates and runs with their required relations and ordering", async () => {
    templatesRepo.find.mockResolvedValue([template()]);
    runsRepo.find.mockResolvedValue([run()]);

    await expect(repo.listTemplatesByUserId("user-1")).resolves.toHaveLength(1);
    await expect(repo.listTemplatesByUserAndPlanId("user-1", "plan-1")).resolves.toHaveLength(1);
    await expect(repo.findRunsForTemplate({ userId: "user-1", templateId: "template-1" })).resolves.toHaveLength(1);
    await expect(repo.listByUserId("user-1")).resolves.toHaveLength(1);
    expect(templatesRepo.find).toHaveBeenCalledWith(expect.objectContaining({ relations: { plan: true } }));
    expect(runsRepo.find).toHaveBeenCalledWith(expect.objectContaining({ relations: { template: { plan: true } } }));
  });

  it("returns an existing template instead of creating a duplicate", async () => {
    const existing = template();
    templatesRepo.findOne.mockResolvedValue(existing);

    await expect(
      repo.findOrCreateTemplate({ userId: "user-1", planId: "plan-1", surfaceUrl: "https://example.com" }),
    ).resolves.toBe(existing);
    expect(templatesRepo.create).not.toHaveBeenCalled();
  });

  it("creates a template with default scheduling and reloads its plan", async () => {
    const row = template();
    templatesRepo.findOne.mockResolvedValue(null);
    templatesRepo.create.mockReturnValue(row);
    templatesRepo.save.mockResolvedValue(row);
    templatesRepo.findOneOrFail.mockResolvedValue(row);

    await expect(
      repo.findOrCreateTemplate({
        userId: "user-1",
        planId: "plan-1",
        surfaceUrl: "https://example.com",
        config: { q: 1 },
      }),
    ).resolves.toBe(row);
    expect(templatesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ scheduleEnabled: false, scheduleCron: null, config: { q: 1 } }),
    );
  });

  it("finds templates and runs scoped to their user", async () => {
    templatesRepo.findOne.mockResolvedValue(template());
    runsRepo.findOne.mockResolvedValue(run());

    await expect(repo.findTemplateByUserAndId({ userId: "user-1", id: "template-1" })).resolves.toEqual(template());
    await expect(repo.findTemplateByUserAndPlanId({ userId: "user-1", planId: "plan-1" })).resolves.toEqual(template());
    await expect(repo.findByUserAndId({ userId: "user-1", id: "run-1" })).resolves.toEqual(run());
    expect(templatesRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ relations: { plan: true } }));
    expect(runsRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ relations: { template: { plan: true } } }));
  });

  it("returns null when a template to patch is missing", async () => {
    templatesRepo.findOne.mockResolvedValue(null);

    await expect(repo.patchSourceTemplate({ userId: "user-1", id: "template-1", patch: {} })).resolves.toBeNull();
  });

  it("normalizes a template patch and reloads the updated row", async () => {
    const existing = template();
    const updated = template();
    updated.scheduleCron = "0 * * * *";
    updated.scheduleEnabled = true;
    updated.surfaceUrl = "https://next.example";
    templatesRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
    templatesRepo.update.mockResolvedValue({ affected: 1 });

    await expect(
      repo.patchSourceTemplate({
        userId: "user-1",
        id: "template-1",
        patch: {
          scheduleCron: " 0 * * * * ",
          scheduleEnabled: true,
          surfaceUrl: " https://next.example ",
          config: { x: 1 },
        },
      }),
    ).resolves.toBe(updated);
    expect(templatesRepo.update).toHaveBeenCalledWith(
      { id: "template-1", userId: "user-1" },
      { scheduleCron: "0 * * * *", scheduleEnabled: true, surfaceUrl: "https://next.example", config: { x: 1 } },
    );
  });

  it("clears blank cron expressions and reports concurrent template deletion", async () => {
    templatesRepo.findOne.mockResolvedValue(template());
    templatesRepo.update.mockResolvedValue({ affected: 0 });

    await expect(
      repo.patchSourceTemplate({ userId: "user-1", id: "template-1", patch: { scheduleCron: "   " } }),
    ).resolves.toBeNull();
    expect(templatesRepo.update).toHaveBeenCalledWith(
      { id: "template-1", userId: "user-1" },
      { scheduleCron: null, scheduleEnabled: false, surfaceUrl: "https://example.com/jobs" },
    );
  });

  it("creates, updates, counts, and deletes runs with scoped criteria", async () => {
    const row = run();
    runsRepo.create.mockReturnValue(row);
    runsRepo.save.mockResolvedValue(row);
    runsRepo.update.mockResolvedValue({ affected: 1 });
    runsRepo.delete
      .mockResolvedValueOnce({ affected: 2 })
      .mockResolvedValueOnce({ affected: 1 })
      .mockResolvedValueOnce({ affected: 0 });
    runsRepo.count.mockResolvedValue(4);

    await expect(
      repo.createRun({
        userId: "user-1",
        templateId: "template-1",
        status: SourceRunStatusEnum.Pending,
        startedAt: row.startedAt,
        surfaceUrl: row.surfaceUrl,
      }),
    ).resolves.toBe(row);
    await expect(
      repo.updateRunSurfaceUrl({ id: "run-1", userId: "user-1", surfaceUrl: "https://next.example" }),
    ).resolves.toBe(true);
    await expect(
      repo.updateStatus({ id: "run-1", userId: "user-1", status: SourceRunStatusEnum.Failed, errorMessage: "failed" }),
    ).resolves.toBe(true);
    await expect(repo.deleteRunsByTemplateId({ userId: "user-1", templateId: "template-1" })).resolves.toBe(2);
    await expect(repo.deleteByUser({ userId: "user-1", id: "run-1" })).resolves.toBe(true);
    await expect(repo.deleteByUser({ userId: "user-1", id: "run-1" })).resolves.toBe(false);
    await expect(repo.countStalePending(new Date("2026-01-01"))).resolves.toBe(4);
  });

  it("deletes all templates for a user", async () => {
    templatesRepo.delete.mockResolvedValue({ affected: 1 });

    await expect(repo.deleteTemplatesByUserId("user-1")).resolves.toBeUndefined();
    expect(templatesRepo.delete).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("maps activity rows to the public activity shape", async () => {
    const qb = {
      select: vi.fn(),
      where: vi.fn(),
      andWhere: vi.fn(),
      orderBy: vi.fn(),
      addOrderBy: vi.fn(),
      getMany: vi.fn(),
    };
    qb.select.mockReturnValue(qb);
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.orderBy.mockReturnValue(qb);
    qb.addOrderBy.mockReturnValue(qb);
    qb.getMany.mockResolvedValue([
      { type: "started", summary: "Started", payload: { x: 1 }, occurredAt: new Date("2026-01-01") },
    ]);
    (runsRepo.manager.createQueryBuilder as ReturnType<typeof vi.fn>).mockReturnValue(qb);

    await expect(repo.findActivityEventsByRunId("user-1", "run-1")).resolves.toEqual([
      { type: "started", summary: "Started", payload: { x: 1 }, occurredAt: new Date("2026-01-01") },
    ]);
    expect(runsRepo.manager.createQueryBuilder).toHaveBeenCalledWith(ExtensionActivityEventEntity, "e");
  });
});
