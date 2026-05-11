import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportTemplateEntity } from "@api/database/entities/import-template.entity";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { ImportRunEventTypeEnum } from "@api/domains/imports/import-run-event-type.enum";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { ImportsRepository } from "@api/domains/imports/imports.repository";
import { ImportsService } from "@api/domains/imports/imports.service";
import { ImportsEventsPublisher } from "@api/domains/imports/imports-events.publisher";
import { PlanRegistryService } from "@api/domains/imports/plan-registry.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

function runWithTemplate(importerId: string): ImportRunEntity {
  const template = {
    id: "tmpl-1",
    userId: "user-1",
    importerId,
    surfaceUrl: "https://example.com/surface",
    scheduleCron: null,
    scheduleEnabled: false,
    createdAt: new Date("2026-05-01T12:00:00.000Z"),
  } as ImportTemplateEntity;
  return {
    id: "run-1",
    userId: "user-1",
    templateId: template.id,
    template,
    surfaceUrl: "https://remoteyeah.com/surface",
    status: ImportRunStatusEnum.RUNNING,
    startedAt: new Date("2026-05-01T12:00:00.000Z"),
  };
}

describe("ImportsService", () => {
  const repo: Pick<
    ImportsRepository,
    | "listByUserId"
    | "findOrCreateTemplate"
    | "createRun"
    | "deleteByUser"
    | "deleteTemplatesByUserId"
    | "findByUserAndId"
    | "findRunsForTemplate"
    | "updateStatus"
    | "resetStaleInProgressRuns"
    | "claimRunning"
    | "listTemplatesByUserAndImporterId"
  > = {
    listByUserId: vi.fn(),
    findOrCreateTemplate: vi.fn(),
    createRun: vi.fn(),
    deleteByUser: vi.fn(),
    deleteTemplatesByUserId: vi.fn(),
    findByUserAndId: vi.fn(),
    findRunsForTemplate: vi.fn(),
    updateStatus: vi.fn(),
    resetStaleInProgressRuns: vi.fn(),
    claimRunning: vi.fn(),
    listTemplatesByUserAndImporterId: vi.fn(),
  };

  const applicationRepo: Pick<
    ApplicationRepository,
    "detachApplicationsImportRun"
  > = { detachApplicationsImportRun: vi.fn() };

  const eventsPublisher: ImportsEventsPublisher = {
    publish: vi.fn(),
    subscribe: vi.fn(() => ({
      [Symbol.asyncIterator]: (): AsyncIterator<never> => ({
        next: async () => ({ value: undefined, done: true }),
      }),
    })),
  };

  const planRegistry = new PlanRegistryService();

  const service = new ImportsService(
    repo as ImportsRepository,
    planRegistry,
    applicationRepo as ApplicationRepository,
    eventsPublisher,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createImportRun creates template and run", async () => {
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      importerId: "remoteyeah",
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as ImportTemplateEntity;
    vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
    vi.mocked(repo.createRun).mockResolvedValue({
      id: "run-1",
      userId: "user-1",
      templateId: "tmpl-1",
      surfaceUrl: "https://remoteyeah.com/surface",
      status: ImportRunStatusEnum.RUNNING,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    } as ImportRunEntity);
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );

    const result = await service.createImportRun("user-1", "remoteyeah");

    expect(repo.findOrCreateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", importerId: "remoteyeah" }),
    );
    expect(repo.createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        templateId: "tmpl-1",
        status: ImportRunStatusEnum.RUNNING,
        surfaceUrl: "https://example.com/surface",
      }),
    );
    expect(result.importerSource).toBe("database");
    expect(result.templateId).toBe("tmpl-1");
    expect(eventsPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        payload: expect.objectContaining({
          type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
          run: expect.objectContaining({
            id: "run-1",
            importerId: "remoteyeah",
          }),
        }),
      }),
    );
    expect(repo.createRun).toHaveBeenCalledBefore(
      vi.mocked(eventsPublisher.publish),
    );
  });

  it("createImportRun rejects unknown importer", async () => {
    await expect(service.createImportRun("user-1", "nope")).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
  });

  it("createImportTemplate ensures template without creating a run", async () => {
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      importerId: "remoteyeah",
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as ImportTemplateEntity;
    vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
    vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

    const result = await service.createImportTemplate("user-1", {
      importerId: "remoteyeah",
      surfaceUrl: "https://example.com",
    });

    expect(repo.findOrCreateTemplate).toHaveBeenCalledWith({
      userId: "user-1",
      importerId: "remoteyeah",
      surfaceUrl: "https://example.com",
    });
    expect(repo.createRun).not.toHaveBeenCalled();
    expect(eventsPublisher.publish).not.toHaveBeenCalled();
    expect(result.id).toBe("tmpl-1");
    expect(result.runs).toEqual([]);
  });

  it("createImportTemplate rejects unknown importer", async () => {
    await expect(
      service.createImportTemplate("user-1", {
        importerId: "nope",
        surfaceUrl: "https://example.com",
      }),
    ).rejects.toThrow(BadRequestException);
    expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
  });

  it("listImportTemplatesForImporter scopes templates by normalized importer", async () => {
    vi.mocked(repo.listTemplatesByUserAndImporterId).mockResolvedValue([
      {
        id: "tmpl-1",
        userId: "user-1",
        importerId: "remoteyeah",
        scheduleCron: null,
        scheduleEnabled: false,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as ImportTemplateEntity,
    ]);
    vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

    const result = await service.listImportTemplatesForImporter(
      "user-1",
      "RemoteYeah",
    );

    expect(repo.listTemplatesByUserAndImporterId).toHaveBeenCalledWith({
      userId: "user-1",
      importerId: "remoteyeah",
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: "tmpl-1",
        importerId: "remoteyeah",
        runs: [],
      }),
    ]);
  });

  it("deleteImportRun removes run owned by user", async () => {
    vi.mocked(repo.deleteByUser).mockResolvedValue(true);
    await expect(
      service.deleteImportRun("user-1", "run-1"),
    ).resolves.toBeUndefined();
    expect(repo.deleteByUser).toHaveBeenCalledWith({
      userId: "user-1",
      id: "run-1",
    });
  });

  it("deleteImportRun rejects missing or other user's run", async () => {
    vi.mocked(repo.deleteByUser).mockResolvedValue(false);
    await expect(service.deleteImportRun("user-1", "run-x")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("clearImportRuns deletes templates for the user", async () => {
    await expect(service.clearImportRuns("user-1")).resolves.toBeUndefined();
    expect(repo.deleteTemplatesByUserId).toHaveBeenCalledWith("user-1");
  });

  it("updateImportRunStatus RUNNING → IN_PROGRESS", async () => {
    const row = runWithTemplate("remoteyeah");
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({
        ...row,
        status: ImportRunStatusEnum.IN_PROGRESS,
      });
    vi.mocked(repo.updateStatus).mockResolvedValue(true);

    const out = await service.updateImportRunStatus(
      "user-1",
      "run-1",
      ImportRunStatusEnum.IN_PROGRESS,
    );

    expect(out.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).toHaveBeenCalledWith({
      userId: "user-1",
      id: "run-1",
      status: ImportRunStatusEnum.IN_PROGRESS,
    });
  });

  it("updateImportRunStatus idempotent when status unchanged", async () => {
    const row = {
      ...runWithTemplate("remoteyeah"),
      status: ImportRunStatusEnum.IN_PROGRESS,
    };
    vi.mocked(repo.findByUserAndId).mockResolvedValue(row);

    const out = await service.updateImportRunStatus(
      "user-1",
      "run-1",
      ImportRunStatusEnum.IN_PROGRESS,
    );

    expect(out.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("updateImportRunStatus rejects invalid transition", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );

    await expect(
      service.updateImportRunStatus(
        "user-1",
        "run-1",
        ImportRunStatusEnum.COMPLETED,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("onModuleInit recovers stale in-progress runs", async () => {
    vi.mocked(repo.resetStaleInProgressRuns).mockResolvedValue(2);

    await expect(service.onModuleInit()).resolves.toBeUndefined();

    expect(repo.resetStaleInProgressRuns).toHaveBeenCalledOnce();
    expect(repo.resetStaleInProgressRuns).toHaveBeenCalledWith(
      expect.any(Date),
    );
  });

  it("claimImportRun reclaims stale in-progress run", async () => {
    const staleStartedAt = new Date(Date.now() - 11 * 60 * 1000);
    const staleRow = {
      ...runWithTemplate("remoteyeah"),
      status: ImportRunStatusEnum.IN_PROGRESS,
      startedAt: staleStartedAt,
    };
    vi.mocked(repo.claimRunning)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(staleRow);
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce(staleRow)
      .mockResolvedValueOnce(staleRow);
    vi.mocked(repo.updateStatus).mockResolvedValue(true);

    const out = await service.claimImportRun("user-1", "run-1");

    expect(out?.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).toHaveBeenNthCalledWith(1, {
      id: "run-1",
      userId: "user-1",
      status: ImportRunStatusEnum.RUNNING,
    });
    expect(repo.claimRunning).toHaveBeenNthCalledWith(2, {
      id: "run-1",
      userId: "user-1",
    });
  });

  it("claimImportRun returns the run when CAS wins (RUNNING -> IN_PROGRESS)", async () => {
    const claimed = {
      ...runWithTemplate("remoteyeah"),
      status: ImportRunStatusEnum.IN_PROGRESS,
    };
    vi.mocked(repo.claimRunning).mockResolvedValue(claimed);

    const out = await service.claimImportRun("user-1", "run-1");

    expect(repo.claimRunning).toHaveBeenCalledWith({
      id: "run-1",
      userId: "user-1",
    });
    expect(out).toMatchObject({
      id: "run-1",
      status: ImportRunStatusEnum.IN_PROGRESS,
      importerSource: "database",
    });
  });

  it("claimImportRun returns null on contention (CAS no row)", async () => {
    vi.mocked(repo.claimRunning).mockResolvedValue(null);

    const out = await service.claimImportRun("user-1", "run-1");

    expect(out).toBeNull();
  });

  it("claimImportRun does not throw when run is missing or not RUNNING", async () => {
    vi.mocked(repo.claimRunning).mockResolvedValue(null);

    await expect(
      service.claimImportRun("user-1", "missing"),
    ).resolves.toBeNull();
  });

  it("claimImportRun: only one winner under concurrent claims", async () => {
    let claimedOnce = false;
    vi.mocked(repo.claimRunning).mockImplementation(async () => {
      if (claimedOnce) {
        return null;
      }
      claimedOnce = true;
      return {
        ...runWithTemplate("remoteyeah"),
        status: ImportRunStatusEnum.IN_PROGRESS,
      };
    });

    const results = await Promise.all([
      service.claimImportRun("user-1", "run-1"),
      service.claimImportRun("user-1", "run-1"),
      service.claimImportRun("user-1", "run-1"),
    ]);

    const winners = results.filter((r) => r !== null);
    expect(winners).toHaveLength(1);
    expect(winners[0]).toMatchObject({
      id: "run-1",
      status: ImportRunStatusEnum.IN_PROGRESS,
    });
  });

  it("importRunEvents yields only events from the current user", async () => {
    vi.mocked(eventsPublisher.subscribe).mockReturnValue({
      [Symbol.asyncIterator]: () => {
        let index = 0;
        const events = [
          {
            userId: "other-user",
            payload: {
              type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
              occurredAt: new Date("2026-05-01T12:00:00.000Z"),
              run: {
                id: "run-other",
                templateId: "t2",
                importerId: "remoteyeah",
                surfaceUrl: "https://example.com",
                status: ImportRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:00.000Z"),
                importerSource: "database" as const,
              },
            },
          },
          {
            userId: "user-1",
            payload: {
              type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
              occurredAt: new Date("2026-05-01T12:00:01.000Z"),
              run: {
                id: "run-1",
                templateId: "t1",
                importerId: "remoteyeah",
                surfaceUrl: "https://example.com",
                status: ImportRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:01.000Z"),
                importerSource: "database" as const,
              },
            },
          },
        ];

        return {
          next: async () => {
            if (index >= events.length) {
              return { value: undefined, done: true };
            }
            const value = events[index];
            index += 1;
            return { value, done: false };
          },
        };
      },
    });

    const iterator = service.importRunEvents("user-1")[Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.done).toBe(false);
    expect(first.value).toMatchObject({
      importRunEvents: {
        type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
        run: { id: "run-1", importerId: "remoteyeah" },
      },
    });
  });

  it("detachApplicationsFromImportRun delegates to application repository", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );
    vi.mocked(applicationRepo.detachApplicationsImportRun).mockResolvedValue(3);

    const n = await service.detachApplicationsFromImportRun("user-1", "run-1");

    expect(n).toBe(3);
    expect(applicationRepo.detachApplicationsImportRun).toHaveBeenCalledWith(
      "run-1",
      "user-1",
    );
  });
});
