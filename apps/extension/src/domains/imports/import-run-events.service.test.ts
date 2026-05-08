import { describe, expect, it, vi } from "vitest";

import type { ApiService } from "@/domains/api/api.service";
import type { ImportApplicationService } from "@/domains/import-application/import-application.service";
import type { LogService } from "@/domains/log/log.service";
import { ImportRunEventType, ImportRunStatus } from "@/gql/graphql";

import { ImportRunEventsService } from "./import-run-events.service";

describe("ImportRunEventsService", () => {
  it("attempts startup recovery for RUNNING runs", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: { id: "run-1" } } },
      importRunsValue: {
        data: {
          importRuns: [
            createRun({ id: "run-1", status: ImportRunStatus.Running }),
            createRun({ id: "run-2", status: ImportRunStatus.Completed }),
          ],
        },
      },
    });

    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.importApplicationService,
    );
    service.start();

    await vi.waitFor(() => {
      expect(setup.claimImportRun).toHaveBeenCalledWith("run-1");
    });
    expect(setup.claimImportRun).not.toHaveBeenCalledWith("run-2");
    expect(setup.executeImportRun).toHaveBeenCalledTimes(1);
  });

  it("does not fail startup when recovery query fails", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: null } },
      importRunsValue: Promise.reject(new Error("network")),
    });
    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.importApplicationService,
    );

    expect(() => service.start()).not.toThrow();
    await vi.waitFor(() => {
      expect(setup.logService.debug).toHaveBeenCalledWith(
        "import-run-events:recovery-error",
        expect.any(Object),
      );
    });
  });

  it("claims and runs created events with status transitions", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: { id: "run-1" } } },
      importRunsValue: { data: { importRuns: [] } },
    });

    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.importApplicationService,
    );
    service.start();

    setup.emitEvent(createEvent(ImportRunEventType.ImportRunCreated));
    await vi.waitFor(() => {
      expect(setup.updateImportRunStatus).toHaveBeenNthCalledWith(
        1,
        "run-1",
        ImportRunStatus.InProgress,
      );
      expect(setup.updateImportRunStatus).toHaveBeenNthCalledWith(
        2,
        "run-1",
        ImportRunStatus.Completed,
      );
    });
    expect(setup.executeImportRun).toHaveBeenCalledTimes(1);
  });

  it("skips execution when claim fails", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: null } },
      importRunsValue: { data: { importRuns: [] } },
    });

    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.importApplicationService,
    );
    service.start();

    setup.emitEvent(createEvent(ImportRunEventType.ImportRunCreated));
    await vi.waitFor(() => {
      expect(setup.claimImportRun).toHaveBeenCalledWith("run-1");
    });
    expect(setup.updateImportRunStatus).not.toHaveBeenCalled();
    expect(setup.executeImportRun).not.toHaveBeenCalled();
  });

  it("marks run failed when execution throws", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: { id: "run-1" } } },
      executeImportRunError: new Error("boom"),
      importRunsValue: { data: { importRuns: [] } },
    });

    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.importApplicationService,
    );
    service.start();

    setup.emitEvent(createEvent(ImportRunEventType.ImportRunCreated));
    await vi.waitFor(() => {
      expect(setup.updateImportRunStatus).toHaveBeenNthCalledWith(
        1,
        "run-1",
        ImportRunStatus.InProgress,
      );
      expect(setup.updateImportRunStatus).toHaveBeenNthCalledWith(
        2,
        "run-1",
        ImportRunStatus.Failed,
      );
    });
  });

  it("ignores unknown events safely", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: null } },
      importRunsValue: { data: { importRuns: [] } },
    });
    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.importApplicationService,
    );
    service.start();

    setup.emitEvent(createEvent("UNKNOWN_EVENT"));
    await Promise.resolve();

    expect(setup.claimImportRun).not.toHaveBeenCalled();
    expect(setup.updateImportRunStatus).not.toHaveBeenCalled();
  });

  it("ensures only one extension instance executes claimed run", async () => {
    const claimImportRun = vi
      .fn()
      .mockResolvedValueOnce({ data: { claimImportRun: { id: "run-1" } } })
      .mockResolvedValueOnce({ data: { claimImportRun: null } });
    const importRuns = vi.fn().mockResolvedValue({ data: { importRuns: [] } });
    const updateImportRunStatus = vi.fn().mockResolvedValue({});

    const handlers: Array<(event: ReturnType<typeof createEvent>) => void> = [];
    const subscribeToImportRunEvents = vi.fn(
      (handler: (event: ReturnType<typeof createEvent>) => void) => {
        handlers.push(handler);
        return { unsubscribe: vi.fn() };
      },
    );

    const apiService = {
      claimImportRun,
      importRuns,
      updateImportRunStatus,
      subscribeToImportRunEvents,
    } as unknown as ApiService;

    const executeA = vi.fn().mockResolvedValue(undefined);
    const executeB = vi.fn().mockResolvedValue(undefined);
    const logA = { debug: vi.fn() } as unknown as LogService;
    const logB = { debug: vi.fn() } as unknown as LogService;

    const serviceA = new ImportRunEventsService(apiService, logA, {
      execute: executeA,
    } as unknown as ImportApplicationService);
    const serviceB = new ImportRunEventsService(apiService, logB, {
      execute: executeB,
    } as unknown as ImportApplicationService);

    serviceA.start();
    serviceB.start();

    const event = createEvent(ImportRunEventType.ImportRunCreated);
    handlers[0]?.(event);
    handlers[1]?.(event);

    await vi.waitFor(() => {
      expect(claimImportRun).toHaveBeenCalledTimes(2);
    });
    await vi.waitFor(() => {
      expect(updateImportRunStatus).toHaveBeenNthCalledWith(
        1,
        "run-1",
        ImportRunStatus.InProgress,
      );
      expect(updateImportRunStatus).toHaveBeenNthCalledWith(
        2,
        "run-1",
        ImportRunStatus.Completed,
      );
    });

    expect(executeA.mock.calls.length + executeB.mock.calls.length).toBe(1);
    expect(updateImportRunStatus).toHaveBeenCalledTimes(2);
  });
});

function createSetup({
  claimValue,
  executeImportRunError,
  importRunsValue,
}: {
  claimValue: { data: { claimImportRun: null | { id: string } } };
  executeImportRunError?: Error;
  importRunsValue:
    | { data: { importRuns: Array<ReturnType<typeof createRun>> } }
    | Promise<never>;
}) {
  const claimImportRun = vi.fn().mockResolvedValue(claimValue);
  const importRuns = vi.fn().mockImplementation(async () => {
    return await importRunsValue;
  });
  const updateImportRunStatus = vi.fn().mockResolvedValue({});
  const subscribeToImportRunEvents = vi.fn(
    (handler: (event: ReturnType<typeof createEvent>) => void) => {
      void handler;
      return { unsubscribe: vi.fn() };
    },
  );
  const apiService = {
    claimImportRun,
    importRuns,
    updateImportRunStatus,
    subscribeToImportRunEvents,
  } as unknown as ApiService;
  const executeImportRun = vi.fn();
  if (executeImportRunError) {
    executeImportRun.mockRejectedValue(executeImportRunError);
  } else {
    executeImportRun.mockResolvedValue(undefined);
  }
  const importApplicationService = {
    execute: executeImportRun,
  } as unknown as ImportApplicationService;
  const logService = { debug: vi.fn() } as unknown as LogService;

  return {
    apiService,
    importApplicationService,
    logService,
    claimImportRun,
    executeImportRun,
    updateImportRunStatus,
    emitEvent(event: ReturnType<typeof createEvent>) {
      const maybeHandler = subscribeToImportRunEvents.mock.calls[0]?.[0];
      if (!maybeHandler) {
        throw new Error("expected subscription event handler");
      }
      (maybeHandler as (value: ReturnType<typeof createEvent>) => void)(event);
    },
  };
}

function createEvent(type: ImportRunEventType | string) {
  return {
    type,
    occurredAt: new Date().toISOString(),
    run: createRun({ id: "run-1", status: ImportRunStatus.Running }),
  };
}

function createRun({ id, status }: { id: string; status: ImportRunStatus }) {
  return {
    id,
    importerId: "imp-1",
    importerName: "Importer",
    entryUrl: "https://example.com/jobs",
    status,
    startedAt: new Date().toISOString(),
    importerSource: "test",
  };
}
