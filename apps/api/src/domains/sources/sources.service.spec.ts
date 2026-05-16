import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { SourceProfileRegistryService } from "@api/domains/sources/source-profile-registry.service";
import { SourceRunEventTypeEnum } from "@api/domains/sources/source-run-event-type.enum";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { SourcesRepository } from "@api/domains/sources/sources.repository";
import { SourcesService } from "@api/domains/sources/sources.service";
import { SourcesEventsPublisher } from "@api/domains/sources/sources-events.publisher";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

function runWithTemplate(sourceProfileId: string): SourceRunEntity {
  const template = {
    id: "tmpl-1",
    userId: "user-1",
    sourceProfileId,
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
    status: SourceRunStatusEnum.RUNNING,
    startedAt: new Date("2026-05-01T12:00:00.000Z"),
  };
}

describe("SourcesService", () => {
  const repo: Pick<
    SourcesRepository,
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
    | "listTemplatesByUserAndSourceProfileId"
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
    listTemplatesByUserAndSourceProfileId: vi.fn(),
  };

  const applicationRepo: Pick<
    ApplicationRepository,
    "detachApplicationsSourceRun"
  > = { detachApplicationsSourceRun: vi.fn() };

  const eventsPublisher: SourcesEventsPublisher = {
    publish: vi.fn(),
    subscribe: vi.fn(() => ({
      [Symbol.asyncIterator]: (): AsyncIterator<never> => ({
        next: async () => ({ value: undefined, done: true }),
      }),
    })),
  };

  const sourceProfileRegistry = new SourceProfileRegistryService();

  const service = new SourcesService(
    repo as SourcesRepository,
    sourceProfileRegistry,
    applicationRepo as ApplicationRepository,
    eventsPublisher,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createSourceRun creates template and run", async () => {
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      sourceProfileId: "remoteyeah",
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceTemplateEntity;
    vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
    vi.mocked(repo.createRun).mockResolvedValue({
      id: "run-1",
      userId: "user-1",
      templateId: "tmpl-1",
      surfaceUrl: "https://remoteyeah.com/surface",
      status: SourceRunStatusEnum.RUNNING,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceRunEntity);
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );

    const result = await service.createSourceRun("user-1", "remoteyeah");

    expect(repo.findOrCreateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        sourceProfileId: "remoteyeah",
      }),
    );
    expect(repo.createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        templateId: "tmpl-1",
        status: SourceRunStatusEnum.RUNNING,
        surfaceUrl: "https://example.com/surface",
      }),
    );
    expect(result.sourceProfile).toBe("database");
    expect(result.templateId).toBe("tmpl-1");
    expect(eventsPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        payload: expect.objectContaining({
          type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
          run: expect.objectContaining({
            id: "run-1",
            sourceProfileId: "remoteyeah",
          }),
        }),
      }),
    );
    expect(repo.createRun).toHaveBeenCalledBefore(
      vi.mocked(eventsPublisher.publish),
    );
  });

  it("createSourceRun rejects unknown source profile", async () => {
    await expect(service.createSourceRun("user-1", "nope")).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
  });

  it("createSourceTemplate ensures template without creating a run", async () => {
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      sourceProfileId: "remoteyeah",
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceTemplateEntity;
    vi.mocked(repo.findOrCreateTemplate).mockResolvedValue(template);
    vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

    const result = await service.createSourceTemplate("user-1", {
      sourceProfileId: "remoteyeah",
      surfaceUrl: "https://example.com",
    });

    expect(repo.findOrCreateTemplate).toHaveBeenCalledWith({
      userId: "user-1",
      sourceProfileId: "remoteyeah",
      surfaceUrl: "https://example.com",
    });
    expect(repo.createRun).not.toHaveBeenCalled();
    expect(eventsPublisher.publish).not.toHaveBeenCalled();
    expect(result.id).toBe("tmpl-1");
    expect(result.runs).toEqual([]);
  });

  it("createSourceTemplate rejects unknown source profile", async () => {
    await expect(
      service.createSourceTemplate("user-1", {
        sourceProfileId: "nope",
        surfaceUrl: "https://example.com",
      }),
    ).rejects.toThrow(BadRequestException);
    expect(repo.findOrCreateTemplate).not.toHaveBeenCalled();
  });

  it("listSourceTemplatesForSourceProfile scopes templates by normalized source profile", async () => {
    vi.mocked(repo.listTemplatesByUserAndSourceProfileId).mockResolvedValue([
      {
        id: "tmpl-1",
        userId: "user-1",
        sourceProfileId: "remoteyeah",
        scheduleCron: null,
        scheduleEnabled: false,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      } as SourceTemplateEntity,
    ]);
    vi.mocked(repo.findRunsForTemplate).mockResolvedValue([]);

    const result = await service.listSourceTemplatesForSourceProfile(
      "user-1",
      "RemoteYeah",
    );

    expect(repo.listTemplatesByUserAndSourceProfileId).toHaveBeenCalledWith({
      userId: "user-1",
      sourceProfileId: "remoteyeah",
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: "tmpl-1",
        sourceProfileId: "remoteyeah",
        runs: [],
      }),
    ]);
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

  it("updateSourceRunStatus RUNNING → IN_PROGRESS", async () => {
    const row = runWithTemplate("remoteyeah");
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({
        ...row,
        status: SourceRunStatusEnum.IN_PROGRESS,
      });
    vi.mocked(repo.updateStatus).mockResolvedValue(true);

    const out = await service.updateSourceRunStatus(
      "user-1",
      "run-1",
      SourceRunStatusEnum.IN_PROGRESS,
    );

    expect(out.status).toBe(SourceRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).toHaveBeenCalledWith({
      userId: "user-1",
      id: "run-1",
      status: SourceRunStatusEnum.IN_PROGRESS,
    });
  });

  it("updateSourceRunStatus idempotent when status unchanged", async () => {
    const row = {
      ...runWithTemplate("remoteyeah"),
      status: SourceRunStatusEnum.IN_PROGRESS,
    };
    vi.mocked(repo.findByUserAndId).mockResolvedValue(row);

    const out = await service.updateSourceRunStatus(
      "user-1",
      "run-1",
      SourceRunStatusEnum.IN_PROGRESS,
    );

    expect(out.status).toBe(SourceRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("updateSourceRunStatus rejects invalid transition", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );

    await expect(
      service.updateSourceRunStatus(
        "user-1",
        "run-1",
        SourceRunStatusEnum.COMPLETED,
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

  it("claimSourceRun reclaims stale in-progress run", async () => {
    const staleStartedAt = new Date(Date.now() - 11 * 60 * 1000);
    const staleRow = {
      ...runWithTemplate("remoteyeah"),
      status: SourceRunStatusEnum.IN_PROGRESS,
      startedAt: staleStartedAt,
    };
    vi.mocked(repo.claimRunning)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(staleRow);
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce(staleRow)
      .mockResolvedValueOnce(staleRow);
    vi.mocked(repo.updateStatus).mockResolvedValue(true);

    const out = await service.claimSourceRun("user-1", "run-1");

    expect(out?.status).toBe(SourceRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).toHaveBeenNthCalledWith(1, {
      id: "run-1",
      userId: "user-1",
      status: SourceRunStatusEnum.RUNNING,
    });
    expect(repo.claimRunning).toHaveBeenNthCalledWith(2, {
      id: "run-1",
      userId: "user-1",
    });
  });

  it("claimSourceRun returns the run when CAS wins (RUNNING -> IN_PROGRESS)", async () => {
    const claimed = {
      ...runWithTemplate("remoteyeah"),
      status: SourceRunStatusEnum.IN_PROGRESS,
    };
    vi.mocked(repo.claimRunning).mockResolvedValue(claimed);

    const out = await service.claimSourceRun("user-1", "run-1");

    expect(repo.claimRunning).toHaveBeenCalledWith({
      id: "run-1",
      userId: "user-1",
    });
    expect(out).toMatchObject({
      id: "run-1",
      status: SourceRunStatusEnum.IN_PROGRESS,
      sourceProfile: "database",
    });
  });

  it("claimSourceRun returns null on contention (CAS no row)", async () => {
    vi.mocked(repo.claimRunning).mockResolvedValue(null);

    const out = await service.claimSourceRun("user-1", "run-1");

    expect(out).toBeNull();
  });

  it("claimSourceRun does not throw when run is missing or not RUNNING", async () => {
    vi.mocked(repo.claimRunning).mockResolvedValue(null);

    await expect(
      service.claimSourceRun("user-1", "missing"),
    ).resolves.toBeNull();
  });

  it("claimSourceRun: only one winner under concurrent claims", async () => {
    let claimedOnce = false;
    vi.mocked(repo.claimRunning).mockImplementation(async () => {
      if (claimedOnce) {
        return null;
      }
      claimedOnce = true;
      return {
        ...runWithTemplate("remoteyeah"),
        status: SourceRunStatusEnum.IN_PROGRESS,
      };
    });

    const results = await Promise.all([
      service.claimSourceRun("user-1", "run-1"),
      service.claimSourceRun("user-1", "run-1"),
      service.claimSourceRun("user-1", "run-1"),
    ]);

    const winners = results.filter((r) => r !== null);
    expect(winners).toHaveLength(1);
    expect(winners[0]).toMatchObject({
      id: "run-1",
      status: SourceRunStatusEnum.IN_PROGRESS,
    });
  });

  it("sourceRunEvents yields only events from the current user", async () => {
    vi.mocked(eventsPublisher.subscribe).mockReturnValue({
      [Symbol.asyncIterator]: () => {
        let index = 0;
        const events = [
          {
            userId: "other-user",
            payload: {
              type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
              occurredAt: new Date("2026-05-01T12:00:00.000Z"),
              run: {
                id: "run-other",
                templateId: "t2",
                sourceProfileId: "remoteyeah",
                surfaceUrl: "https://example.com",
                status: SourceRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:00.000Z"),
                sourceProfile: "database" as const,
              },
            },
          },
          {
            userId: "user-1",
            payload: {
              type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
              occurredAt: new Date("2026-05-01T12:00:01.000Z"),
              run: {
                id: "run-1",
                templateId: "t1",
                sourceProfileId: "remoteyeah",
                surfaceUrl: "https://example.com",
                status: SourceRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:01.000Z"),
                sourceProfile: "database" as const,
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

    const iterator = service.sourceRunEvents("user-1")[Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.done).toBe(false);
    expect(first.value).toMatchObject({
      sourceRunEvents: {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        run: { id: "run-1", sourceProfileId: "remoteyeah" },
      },
    });
  });

  it("detachApplicationsFromSourceRun delegates to application repository", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );
    vi.mocked(applicationRepo.detachApplicationsSourceRun).mockResolvedValue(3);

    const result = await service.detachApplicationsFromSourceRun(
      "user-1",
      "run-1",
    );

    expect(result).toBe(3);
    expect(applicationRepo.detachApplicationsSourceRun).toHaveBeenCalledWith(
      "run-1",
      "user-1",
    );
  });
});
