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

function publishedAtPlanEntity() {
  return planEntity({
    document: {
      steps: [
        {
          action: {
            input: {
              surfaceFields: [{ key: "publishedAt", selector: ".date", type: "property", value: "innerText" }],
            },
          },
        },
      ],
    },
  });
}

function runWithTemplate(planId: string, config?: Record<string, unknown>): SourceRunEntity {
  const plan = planEntity();
  const template = {
    id: "tmpl-1",
    userId: "user-1",
    planId,
    plan,
    surfaceUrl: "https://example.com/surface",
    scheduleCron: null,
    scheduleEnabled: false,
    ...(config !== undefined ? { config } : {}),
    createdAt: new Date("2026-05-01T12:00:00.000Z"),
  } as unknown as SourceTemplateEntity;
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
    | "findTemplateByUserAndId"
    | "createRun"
    | "deleteByUser"
    | "deleteTemplatesByUserId"
    | "findByUserAndId"
    | "findRunsForTemplate"
    | "updateStatus"
    | "countStalePending"
    | "listTemplatesByUserId"
    | "patchSourceTemplate"
    | "listTemplatesByUserAndPlanId"
    | "deleteRunsByTemplateId"
    | "findRunsForTemplate"
  > = {
    listByUserId: vi.fn(),
    findOrCreateTemplate: vi.fn(),
    findTemplateByUserAndPlanId: vi.fn(),
    findTemplateByUserAndId: vi.fn(),
    createRun: vi.fn(),
    deleteByUser: vi.fn(),
    deleteTemplatesByUserId: vi.fn(),
    findByUserAndId: vi.fn(),
    findRunsForTemplate: vi.fn(),
    updateStatus: vi.fn(),
    countStalePending: vi.fn(),
    listTemplatesByUserId: vi.fn(),
    patchSourceTemplate: vi.fn(),
    listTemplatesByUserAndPlanId: vi.fn(),
    deleteRunsByTemplateId: vi.fn(),
    findRunsForTemplate: vi.fn(),
  };

  const jobRepo: Pick<
    JobsRepository,
    | "detachJobsSourceRun"
    | "countBySourceRunIds"
    | "deleteBySourceRunId"
    | "deleteBySourceRunId"
  > = {
    detachJobsSourceRun: vi.fn(),
    countBySourceRunIds: vi.fn(),
    deleteBySourceRunId: vi.fn(),
    deleteBySourceRunId: vi.fn(),
  };

  const eventBus: Pick<SourcesEventBus, "emit"> = { emit: vi.fn() };

  const planService = {
    findById: vi.fn(async (id: string) => {
      if (id === "plan-1") return planEntity();
      if (id === "plan-with-publishedAt") return publishedAtPlanEntity();
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

  describe("createSourceRun", () => {
    it("creates run from existing template", async () => {
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
      } as unknown as SourceTemplateEntity;
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

    it("rejects unknown plan", async () => {
      await expect(service.createSourceRun("user-1", "nope")).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findTemplateByUserAndPlanId).not.toHaveBeenCalled();
    });
  });

  describe("createSourceTemplate", () => {
    it("creates template without config", async () => {
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
      } as unknown as SourceTemplateEntity;
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
      expect(result.id).toBe("tmpl-1");
      expect(result.runs).toEqual([]);
    });

    it("rejects unknown plan", async () => {
      await expect(
        service.createSourceTemplate("user-1", {
          planId: "nope",
          surfaceUrl: "https://example.com",
        }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
    });

    it("creates template with valid CatchUp config", async () => {
      const plan = planEntity();
      const config = { stopWhen: ["CatchUp"], catchUpThreshold: 5 };
      const template = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-1",
        plan,
        surfaceUrl: "https://example.com/surface",
        scheduleCron: null,
        scheduleEnabled: false,
        config,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

      const result = await service.createSourceTemplate("user-1", {
        planId: "plan-1",
        surfaceUrl: "https://example.com",
        config,
      });

      expect(repo.findOrCreateTemplate).toHaveBeenCalledWith({
        userId: "user-1",
        planId: "plan-1",
        surfaceUrl: "https://example.com",
        config,
      });
      expect(result.id).toBe("tmpl-1");
    });

    it("rejects CatchUp without threshold", async () => {
      await expect(
        service.createSourceTemplate("user-1", {
          planId: "plan-1",
          surfaceUrl: "https://example.com",
          config: { stopWhen: ["CatchUp"] },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
    });

    it("rejects FirstRunMaxPages without maxPages", async () => {
      await expect(
        service.createSourceTemplate("user-1", {
          planId: "plan-1",
          surfaceUrl: "https://example.com",
          config: { stopWhen: ["FirstRunMaxPages"] },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
    });

    it("rejects OlderThan without olderThanDays", async () => {
      await expect(
        service.createSourceTemplate("user-1", {
          planId: "plan-with-publishedAt",
          surfaceUrl: "https://example.com",
          config: { stopWhen: ["OlderThan"] },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
    });

    it("rejects OlderThan when plan lacks publishedAt surfaceField", async () => {
      await expect(
        service.createSourceTemplate("user-1", {
          planId: "plan-1",
          surfaceUrl: "https://example.com",
          config: { stopWhen: ["OlderThan"], olderThanDays: 30 },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
    });

    it("accepts OlderThan when plan has publishedAt surfaceField", async () => {
      const config = { stopWhen: ["OlderThan"], olderThanDays: 30 };
      const template = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-with-publishedAt",
        plan: publishedAtPlanEntity(),
        surfaceUrl: "https://example.com/surface",
        scheduleCron: null,
        scheduleEnabled: false,
        config,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

      const result = await service.createSourceTemplate("user-1", {
        planId: "plan-with-publishedAt",
        surfaceUrl: "https://example.com",
        config,
      });

      expect(result.id).toBe("tmpl-1");
    });

    it("ignores config when template already exists", async () => {
      const plan = planEntity();
      const config = { stopWhen: ["CatchUp"], catchUpThreshold: 5 };
      const existingTemplate = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-1",
        plan,
        surfaceUrl: "https://existing.com",
        scheduleCron: null,
        scheduleEnabled: false,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(existingTemplate);
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

      const result = await service.createSourceTemplate("user-1", {
        planId: "plan-1",
        surfaceUrl: "https://existing.com",
        config,
      });

      expect(result.id).toBe("tmpl-1");
      expect(repo.findOrCreateTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ config }),
      );
    });
  });

  describe("updateSourceTemplate", () => {
    it("updates template with valid config", async () => {
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
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findTemplateByUserAndId).mockResolvedValue(template);
      vi.mocked(repo.patchSourceTemplate).mockResolvedValue({
        ...template,
        config: { stopWhen: ["CatchUp"], catchUpThreshold: 5 },
      });
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

      const result = await service.updateSourceTemplate("user-1", "tmpl-1", {
        config: { stopWhen: ["CatchUp"], catchUpThreshold: 5 },
      });

      expect(repo.patchSourceTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          id: "tmpl-1",
          patch: expect.objectContaining({
            config: { stopWhen: ["CatchUp"], catchUpThreshold: 5 },
          }),
        }),
      );
      expect(result.id).toBe("tmpl-1");
    });

    it("rejects update with invalid config", async () => {
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
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findTemplateByUserAndId).mockResolvedValue(template);

      await expect(
        service.updateSourceTemplate("user-1", "tmpl-1", {
          config: { stopWhen: ["CatchUp"] },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.patchSourceTemplate).not.toHaveBeenCalled();
    });

    it("rejects update with OlderThan when plan lacks publishedAt", async () => {
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
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findTemplateByUserAndId).mockResolvedValue(template);

      await expect(
        service.updateSourceTemplate("user-1", "tmpl-1", {
          config: { stopWhen: ["OlderThan"], olderThanDays: 30 },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.patchSourceTemplate).not.toHaveBeenCalled();
    });

    it("updates non-config fields without config validation", async () => {
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
      } as unknown as SourceTemplateEntity;
      vi.mocked(repo.findTemplateByUserAndId).mockResolvedValue(template);
      vi.mocked(repo.patchSourceTemplate).mockResolvedValue({
        ...template,
        surfaceUrl: "https://new-url.com",
      });
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

      await service.updateSourceTemplate("user-1", "tmpl-1", {
        surfaceUrl: "https://new-url.com",
      });

      expect(repo.patchSourceTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "tmpl-1",
          patch: expect.objectContaining({
            surfaceUrl: "https://new-url.com",
          }),
        }),
      );
    });
  });

  describe("toGql — SourceRun stop config fields", () => {
    it("returns stop config fields from template config", async () => {
      const config = { stopWhen: ["CatchUp"], catchUpThreshold: 5 };
      const plan = planEntity();
      const template = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-1",
        plan,
        surfaceUrl: "https://example.com/surface",
        scheduleCron: null,
        scheduleEnabled: false,
        config,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as unknown as SourceTemplateEntity;
      const run: SourceRunEntity = {
        id: "run-1",
        userId: "user-1",
        templateId: "tmpl-1",
        template,
        surfaceUrl: "https://remoteyeah.com/surface",
        status: SourceRunStatusEnum.Pending,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
      };
      vi.mocked(repo.listByUserId).mockResolvedValue([run]);

      const [out] = await service.listSourceRuns("user-1");

      expect(out.stopWhen).toBe("CatchUp");
      expect(out.catchUpThreshold).toBe(5);
      expect(out.maxPages).toBeNull();
      expect(out.olderThanDays).toBeNull();
    });

    it("returns null stop config when template has no config", async () => {
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
      } as unknown as SourceTemplateEntity;
      const run: SourceRunEntity = {
        id: "run-1",
        userId: "user-1",
        templateId: "tmpl-1",
        template,
        surfaceUrl: "https://remoteyeah.com/surface",
        status: SourceRunStatusEnum.Pending,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
      };
      vi.mocked(repo.listByUserId).mockResolvedValue([run]);

      const [out] = await service.listSourceRuns("user-1");

      expect(out.stopWhen).toBeNull();
      expect(out.catchUpThreshold).toBeNull();
      expect(out.maxPages).toBeNull();
      expect(out.olderThanDays).toBeNull();
    });

    it("returns FirstRunMaxPages config fields", async () => {
      const config = { stopWhen: ["FirstRunMaxPages"], maxPages: 3 };
      const plan = planEntity();
      const template = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-1",
        plan,
        surfaceUrl: "https://example.com/surface",
        scheduleCron: null,
        scheduleEnabled: false,
        config,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as unknown as SourceTemplateEntity;
      const run: SourceRunEntity = {
        id: "run-1",
        userId: "user-1",
        templateId: "tmpl-1",
        template,
        surfaceUrl: "https://remoteyeah.com/surface",
        status: SourceRunStatusEnum.Pending,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
      };
      vi.mocked(repo.listByUserId).mockResolvedValue([run]);

      const [out] = await service.listSourceRuns("user-1");

      expect(out.stopWhen).toBe("FirstRunMaxPages");
      expect(out.maxPages).toBe(3);
      expect(out.catchUpThreshold).toBeNull();
      expect(out.olderThanDays).toBeNull();
    });

    it("returns OlderThan config fields", async () => {
      const config = { stopWhen: ["OlderThan"], olderThanDays: 14 };
      const plan = planEntity();
      const template = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-1",
        plan,
        surfaceUrl: "https://example.com/surface",
        scheduleCron: null,
        scheduleEnabled: false,
        config,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as unknown as SourceTemplateEntity;
      const run: SourceRunEntity = {
        id: "run-1",
        userId: "user-1",
        templateId: "tmpl-1",
        template,
        surfaceUrl: "https://remoteyeah.com/surface",
        status: SourceRunStatusEnum.Pending,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
      };
      vi.mocked(repo.listByUserId).mockResolvedValue([run]);

      const [out] = await service.listSourceRuns("user-1");

      expect(out.stopWhen).toBe("OlderThan");
      expect(out.olderThanDays).toBe(14);
      expect(out.catchUpThreshold).toBeNull();
      expect(out.maxPages).toBeNull();
    });
  });

  describe("deleteSourceRun", () => {
    it("removes run owned by user", async () => {
      vi.mocked(repo.deleteByUser).mockResolvedValue(true);
      await expect(
        service.deleteSourceRun("user-1", "run-1"),
      ).resolves.toBeUndefined();
      expect(repo.deleteByUser).toHaveBeenCalledWith({
        userId: "user-1",
        id: "run-1",
      });
    });

    it("rejects missing or other user's run", async () => {
      vi.mocked(repo.deleteByUser).mockResolvedValue(false);
      await expect(service.deleteSourceRun("user-1", "run-x")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it("clearSourceRuns deletes templates for the user", async () => {
    await expect(service.clearSourceRuns("user-1")).resolves.toBeUndefined();
    expect(repo.deleteTemplatesByUserId).toHaveBeenCalledWith("user-1");
  });

  describe("updateSourceRunStatus", () => {
    it("Pending → Completed", async () => {
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

    it("idempotent when status unchanged", async () => {
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

    it("rejects Completed → Pending", async () => {
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

  describe("listTemplatesForPlan — batch runs", () => {
    it("calls findRunsForTemplates once with all template IDs", async () => {
      const plan = planEntity();
      const templates = [
        { id: "t1", userId: "user-1", planId: "plan-1", plan },
        { id: "t2", userId: "user-1", planId: "plan-1", plan },
      ] as SourceTemplateEntity[];

      const t1runs = [{ id: "r1", templateId: "t1" }];
      const t2runs = [{ id: "r2", templateId: "t2" }];
      vi.mocked(repo.listTemplatesByUserAndPlanId).mockResolvedValue(templates);
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue(
        t1runs.concat(t2runs) as never,
      );
      vi.mocked(jobRepo.countBySourceRunIds).mockResolvedValue(
        new Map([["r1", 3], ["r2", 7]]),
      );

      const result = await service.listTemplatesForPlan("user-1", "plan-1");

      expect(result).toHaveLength(2);
      expect(repo.findRunsForTemplate).toHaveBeenCalledTimes(1);
      expect(jobRepo.countBySourceRunIds).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearTemplateRuns — batch DELETE", () => {
    it("calls deleteBySourceRunIds once with all run IDs", async () => {
      const template = {
        id: "tmpl-1",
        userId: "user-1",
        planId: "plan-1",
      } as SourceTemplateEntity;

      const runs = [
        { id: "run-1" },
        { id: "run-2" },
      ] as SourceRunEntity[];

      vi.mocked(repo.findTemplateByUserAndId).mockResolvedValue(template);
      vi.mocked(repo.findRunsForTemplate).mockResolvedValue(runs);
      vi.mocked(repo.deleteRunsByTemplateId).mockResolvedValue(2);
      vi.mocked(jobRepo.deleteBySourceRunId).mockResolvedValue(0);

      await service.clearTemplateRuns("user-1", "tmpl-1", {
        deleteJobs: true,
      });

      expect(jobRepo.deleteBySourceRunId).toHaveBeenCalledTimes(1);
      expect(jobRepo.deleteBySourceRunId).toHaveBeenCalledWith(
        ["run-1", "run-2"],
        "user-1",
      );
    });
  });
});
