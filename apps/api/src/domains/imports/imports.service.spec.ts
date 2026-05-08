import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportRunEventTypeEnum } from "@api/domains/imports/import-run-event-type.enum";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { ImportsRepository } from "@api/domains/imports/imports.repository";
import { ImportsService } from "@api/domains/imports/imports.service";
import { ImportsEventsPublisher } from "@api/domains/imports/imports-events.publisher";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ImportsService", () => {
  const repo: Pick<
    ImportsRepository,
    | "listByUserId"
    | "create"
    | "deleteByUser"
    | "deleteAllByUserId"
    | "findByUserAndId"
    | "updateStatus"
    | "resetStaleInProgressRuns"
    | "claimRunning"
  > = {
    listByUserId: vi.fn(),
    create: vi.fn(),
    deleteByUser: vi.fn(),
    deleteAllByUserId: vi.fn(),
    findByUserAndId: vi.fn(),
    updateStatus: vi.fn(),
    resetStaleInProgressRuns: vi.fn(),
    claimRunning: vi.fn(),
  };

  const eventsPublisher: ImportsEventsPublisher = {
    publish: vi.fn(),
    subscribe: vi.fn(() => ({
      [Symbol.asyncIterator]: (): AsyncIterator<never> => ({
        next: async () => ({ value: undefined, done: true }),
      }),
    })),
  };

  const service = new ImportsService(
    repo as ImportsRepository,
    eventsPublisher,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createImportRun persists RemoteYeah entry URL", async () => {
    const startedAt = new Date("2026-05-01T12:00:00.000Z");
    vi.mocked(repo.create).mockResolvedValue({
      id: "run-1",
      userId: "user-1",
      importerId: "remoteyeah",
      importerName: "RemoteYeah",
      entryUrl:
        "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide#jobs",
      status: ImportRunStatusEnum.RUNNING,
      startedAt,
    } as ImportRunEntity);

    const result = await service.createImportRun("user-1", "remoteyeah");

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        importerId: "remoteyeah",
        importerName: "RemoteYeah",
        entryUrl:
          "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide#jobs",
        status: ImportRunStatusEnum.RUNNING,
      }),
    );
    expect(result.entryUrl).toContain("remoteyeah.com");
    expect(result.importerSource).toBe("database");
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
    expect(repo.create).toHaveBeenCalledBefore(
      vi.mocked(eventsPublisher.publish),
    );
  });

  it("createImportRun rejects unknown importer", async () => {
    await expect(service.createImportRun("user-1", "nope")).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.create).not.toHaveBeenCalled();
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

  it("clearImportRuns deletes all runs for the user", async () => {
    vi.mocked(repo.deleteAllByUserId).mockResolvedValue(3);
    await expect(service.clearImportRuns("user-1")).resolves.toBeUndefined();
    expect(repo.deleteAllByUserId).toHaveBeenCalledWith("user-1");
  });

  it("updateImportRunStatus RUNNING → IN_PROGRESS", async () => {
    const row = {
      id: "run-1",
      userId: "user-1",
      importerId: "remoteyeah",
      importerName: "RemoteYeah",
      entryUrl: "https://remoteyeah.com/board",
      status: ImportRunStatusEnum.RUNNING,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    };
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce(row as ImportRunEntity)
      .mockResolvedValueOnce({
        ...row,
        status: ImportRunStatusEnum.IN_PROGRESS,
      } as ImportRunEntity);
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
      id: "run-1",
      userId: "user-1",
      importerId: "remoteyeah",
      importerName: "RemoteYeah",
      entryUrl: "https://remoteyeah.com/board",
      status: ImportRunStatusEnum.IN_PROGRESS,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    };
    vi.mocked(repo.findByUserAndId).mockResolvedValue(row as ImportRunEntity);

    const out = await service.updateImportRunStatus(
      "user-1",
      "run-1",
      ImportRunStatusEnum.IN_PROGRESS,
    );

    expect(out.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("updateImportRunStatus rejects invalid transition", async () => {
    vi.mocked(repo.findByUserAndId).mockResolvedValue({
      id: "run-1",
      userId: "user-1",
      importerId: "remoteyeah",
      importerName: "RemoteYeah",
      entryUrl: "https://remoteyeah.com/board",
      status: ImportRunStatusEnum.RUNNING,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    } as ImportRunEntity);

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
    vi.mocked(repo.claimRunning)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "run-1",
        userId: "user-1",
        importerId: "remoteyeah",
        importerName: "RemoteYeah",
        entryUrl: "https://remoteyeah.com/board",
        status: ImportRunStatusEnum.IN_PROGRESS,
        startedAt: staleStartedAt,
      } as ImportRunEntity);
    vi.mocked(repo.findByUserAndId)
      .mockResolvedValueOnce({
        id: "run-1",
        userId: "user-1",
        importerId: "remoteyeah",
        importerName: "RemoteYeah",
        entryUrl: "https://remoteyeah.com/board",
        status: ImportRunStatusEnum.IN_PROGRESS,
        startedAt: staleStartedAt,
      } as ImportRunEntity)
      .mockResolvedValueOnce({
        id: "run-1",
        userId: "user-1",
        importerId: "remoteyeah",
        importerName: "RemoteYeah",
        entryUrl: "https://remoteyeah.com/board",
        status: ImportRunStatusEnum.IN_PROGRESS,
        startedAt: staleStartedAt,
      } as ImportRunEntity);
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
    const claimed: ImportRunEntity = {
      id: "run-1",
      userId: "user-1",
      importerId: "remoteyeah",
      importerName: "RemoteYeah",
      entryUrl: "https://remoteyeah.com/board",
      status: ImportRunStatusEnum.IN_PROGRESS,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    } as ImportRunEntity;
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
        id: "run-1",
        userId: "user-1",
        importerId: "remoteyeah",
        importerName: "RemoteYeah",
        entryUrl: "https://remoteyeah.com/board",
        status: ImportRunStatusEnum.IN_PROGRESS,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
      } as ImportRunEntity;
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
                importerId: "remoteyeah",
                importerName: "RemoteYeah",
                entryUrl: "https://remoteyeah.com/board",
                status: ImportRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:00.000Z"),
                importerSource: "database",
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
                importerId: "remoteyeah",
                importerName: "RemoteYeah",
                entryUrl: "https://remoteyeah.com/board",
                status: ImportRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:01.000Z"),
                importerSource: "database",
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
      type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
      run: { id: "run-1", importerId: "remoteyeah" },
    });
  });
});
