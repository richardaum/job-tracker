import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
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
    | "findTemplateByUserAndSourceProfile"
    | "createRun"
    | "deleteByUser"
    | "deleteTemplatesByUserId"
    | "findByUserAndId"
    | "findRunsForTemplate"
    | "updateStatus"
    | "resetStaleInProgressRuns"
    | "listTemplatesByUserAndSourceProfileId"
  > = {
    listByUserId: vi.fn(),
    findOrCreateTemplate: vi.fn(),
    findTemplateByUserAndSourceProfile: vi.fn(),
    createRun: vi.fn(),
    deleteByUser: vi.fn(),
    deleteTemplatesByUserId: vi.fn(),
    findByUserAndId: vi.fn(),
    findRunsForTemplate: vi.fn(),
    updateStatus: vi.fn(),
    resetStaleInProgressRuns: vi.fn(),
    listTemplatesByUserAndSourceProfileId: vi.fn(),
  };

  const jobRepo: Pick<JobsRepository, "detachJobsSourceRun"> = {
    detachJobsSourceRun: vi.fn(),
  };

  const eventsPublisher: Pick<SourcesEventsPublisher, "publish"> = {
    publish: vi.fn(),
  };

  const sourceProfileRegistry = new SourceProfileRegistryService();

  const service = new SourcesService(
    repo as SourcesRepository,
    sourceProfileRegistry,
    jobRepo as JobsRepository,
    eventsPublisher as SourcesEventsPublisher,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createSourceRun creates run from existing template", async () => {
    const template = {
      id: "tmpl-1",
      userId: "user-1",
      sourceProfileId: "remoteyeah",
      surfaceUrl: "https://example.com/surface",
      scheduleCron: null,
      scheduleEnabled: false,
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    } as SourceTemplateEntity;
    vi.mocked(repo.findTemplateByUserAndSourceProfile).mockResolvedValue(
      template,
    );
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

    expect(repo.findTemplateByUserAndSourceProfile).toHaveBeenCalledWith({
      userId: "user-1",
      sourceProfileId: "remoteyeah",
    });
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
    expect(repo.findTemplateByUserAndSourceProfile).not.toHaveBeenCalled();
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

  it("detachJobsFromSourceRun delegates to job repository", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue(
      runWithTemplate("remoteyeah"),
    );
    vi.mocked(jobRepo.detachJobsSourceRun).mockResolvedValue(3);

    const result = await service.detachJobsFromSourceRun("user-1", "run-1");

    expect(result).toBe(3);
    expect(jobRepo.detachJobsSourceRun).toHaveBeenCalledWith("run-1", "user-1");
  });
});
