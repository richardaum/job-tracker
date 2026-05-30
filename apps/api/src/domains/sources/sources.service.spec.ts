import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { SourceRunEventTypeEnum } from "@api/domains/sources/source-run-event-type.enum";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { SourcesRepository } from "@api/domains/sources/sources.repository";
import { SourcesService } from "@api/domains/sources/sources.service";
import type { SourcesEventBus } from "@api/domains/sources/sources-event.bus";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

function planEntity(overrides?: Partial<SourceTemplateEntity["plan"]>) {
  return {
    id: "plan-1",
    displayName: "RemoteYeah",
    document: { steps: [] },
    createdAt: new Date("2026-05-01T12:00:00.000Z"),
    updatedAt: new Date("2026-05-01T12:00:00.000Z"),
    ...overrides,
  } as SourceTemplateEntity["plan"];
}

function runWithTemplate(planId: string): SourceRunEntity {
  const plan = planEntity();
  const template = {
    id: "tmpl-1",
    userId: "user-1",
    planId,
    plan,
    surfaceUrl: "https://example.com/surface",
    scheduleCron: null,
    scheduleEnabled: false,
    createdAt: new Date("2026-05-01T12:00:00.000Z"),
  } as SourceTemplateEntity;
  return {
    id: "run-1",
    userId: "user-1",
    templateId: template.id,
    template,
    surfaceUrl: "https://remoteyeah.com/surface",
    status: SourceRunStatusEnum.Pending,
    startedAt: new Date("2026-05-01T12:00:00.000Z"),
  };
}

describe("SourcesService", () => {
  const repo: Pick<
    SourcesRepository,
    | "listByUserId"
    | "findOrCreateTemplate"
    | "findTemplateByUserAndPlanId"
    | "createRun"
    | "deleteByUser"
    | "deleteTemplatesByUserId"
    | "findByUserAndId"
    | "findRunsForTemplate"
    | "updateStatus"
    | "countStalePending"
    | "listTemplatesByUserId"
  > = {
    listByUserId: vi.fn(),
    findOrCreateTemplate: vi.fn(),
    findTemplateByUserAndPlanId: vi.fn(),
    createRun: vi.fn(),
    deleteByUser: vi.fn(),
    deleteTemplatesByUserId: vi.fn(),
    findByUserAndId: vi.fn(),
    findRunsForTemplate: vi.fn(),
    updateStatus: vi.fn(),
    countStalePending: vi.fn(),
    listTemplatesByUserId: vi.fn(),
  };

  const jobRepo: Pick<JobsRepository, "detachJobsSourceRun"> = {
    detachJobsSourceRun: vi.fn(),
  };

  const eventBus: Pick<SourcesEventBus, "emit"> = { emit: vi.fn() };

  const planService = {
    findById: vi.fn(async (id: string) => {
      if (id === "plan-1") return planEntity();
      throw new NotFoundException(`Plan ${id} not found`);
    }),
  };

  const service = new SourcesService(
    repo as SourcesRepository,
    planService as never,
    jobRepo as JobsRepository,
    eventBus as SourcesEventBus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createSourceRun creates run from existing template", async () => {
    const plan = planEntity();
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      planId: "plan-1",
      plan,
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceTemplateEntity;
    vi.mocked(repo.findTemplateByUserAndPlanId).mockResolvedValue(template);
    vi.mocked(repo.createRun).mockResolvedValue({
      id: "run-1",
      userId: "user-1",
      templateId: "tmpl-1",
      surfaceUrl: "https://remoteyeah.com/surface",
      status: SourceRunStatusEnum.Pending,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceRunEntity);
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("plan-1"),
    );

    const result = await service.createSourceRun("user-1", "plan-1");

    expect(repo.findTemplateByUserAndPlanId).toHaveBeenCalledWith({
      userId: "user-1",
      planId: "plan-1",
    });
    expect(repo.createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        templateId: "tmpl-1",
        status: SourceRunStatusEnum.Pending,
        surfaceUrl: "https://example.com/surface",
      }),
    );
    expect(result.templateId).toBe("tmpl-1");
    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        payload: expect.objectContaining({
          type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
          run: expect.objectContaining({ id: "run-1" }),
        }),
      }),
    );
    expect(repo.createRun).toHaveBeenCalledBefore(vi.mocked(eventBus.emit));
  });

  it("createSourceRun rejects unknown plan", async () => {
    await expect(service.createSourceRun("user-1", "nope")).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.findTemplateByUserAndPlanId).not.toHaveBeenCalled();
  });

  it("createSourceTemplate ensures template without creating a run", async () => {
    const plan = planEntity();
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      planId: "plan-1",
      plan,
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceTemplateEntity;
    vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
    vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

    const result = await service.createSourceTemplate("user-1", {
      planId: "plan-1",
      surfaceUrl: "https://example.com",
    });

    expect(repo.findOrCreateTemplate).toHaveBeenCalledWith({
      userId: "user-1",
      planId: "plan-1",
      surfaceUrl: "https://example.com",
    });
    expect(repo.createRun).not.toHaveBeenCalled();
    expect(eventBus.emit).not.toHaveBeenCalled();
    expect(result.id).toBe("tmpl-1");
    expect(result.runs).toEqual([]);
  });

  it("createSourceTemplate rejects unknown plan", async () => {
    await expect(
      service.createSourceTemplate("user-1", {
        planId: "nope",
        surfaceUrl: "https://example.com",
      }),
    ).rejects.toThrow(NotFoundException);

    expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
  });

  it("deleteSourceRun removes run owned by user", async () => {
    vi.mocked(repo.deleteByUser).mockResolvedValue(true);
    await expect(
      service.deleteSourceRun("user-1", "run-1"),
    ).resolves.toBeUndefined();
    expect(repo.deleteByUser).toHaveBeenCalledWith({
      userId: "user-1",
      id: "run-1",
    });
  });

  it("deleteSourceRun rejects missing or other user's run", async () => {
    vi.mocked(repo.deleteByUser).mockResolvedValue(false);
    await expect(service.deleteSourceRun("user-1", "run-x")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("clearSourceRuns deletes templates for the user", async () => {
    await expect(service.clearSourceRuns("user-1")).resolves.toBeUndefined();
    expect(repo.deleteTemplatesByUserId).toHaveBeenCalledWith("user-1");
  });

  it("updateSourceRunStatus Pending → Completed", async () => {
    const row = runWithTemplate("plan-1");
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({ ...row, status: SourceRunStatusEnum.Completed });
    vi.mocked(repo.updateStatus).mockResolvedValue(true);

    const out = await service.updateSourceRunStatus(
      "user-1",
      "run-1",
      SourceRunStatusEnum.Completed,
    );

    expect(out.status).toBe(SourceRunStatusEnum.Completed);
    expect(repo.updateStatus).toHaveBeenCalledWith({
      userId: "user-1",
      id: "run-1",
      status: SourceRunStatusEnum.Completed,
    });
  });

  it("updateSourceRunStatus idempotent when status unchanged", async () => {
    const row = {
      ...runWithTemplate("plan-1"),
      status: SourceRunStatusEnum.Completed,
    };
    vi.mocked(repo.findByUserAndId).mockResolvedValue(row);

    const out = await service.updateSourceRunStatus(
      "user-1",
      "run-1",
      SourceRunStatusEnum.Completed,
    );

    expect(out.status).toBe(SourceRunStatusEnum.Completed);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("updateSourceRunStatus rejects Completed → Pending", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue({
      ...runWithTemplate("plan-1"),
      status: SourceRunStatusEnum.Completed,
    });

    await expect(
      service.updateSourceRunStatus(
        "user-1",
        "run-1",
        SourceRunStatusEnum.Pending,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("onModuleInit logs stale pending runs", async () => {
    vi.mocked(repo.countStalePending).mockResolvedValue(2);

    await expect(service.onModuleInit()).resolves.toBeUndefined();

    expect(repo.countStalePending).toHaveBeenCalledOnce();
    expect(repo.countStalePending).toHaveBeenCalledWith(expect.any(Date));
  });

  it("detachJobsFromSourceRun delegates to job repository", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("plan-1"),
    );
    vi.mocked(jobRepo.detachJobsSourceRun).mockResolvedValue(3);

    const result = await service.detachJobsFromSourceRun("user-1", "run-1");

    expect(result).toBe(3);
    expect(jobRepo.detachJobsSourceRun).toHaveBeenCalledWith("run-1", "user-1");
  });
});
