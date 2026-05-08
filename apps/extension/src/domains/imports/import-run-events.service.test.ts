import { describe, expect, it, vi } from "vitest";

import type { ApiService } from "@/domains/api/api.service";
import type { ImportApplicationService } from "@/domains/import-application/import-application.service";
import type { LogService } from "@/domains/log/log.service";
import { ImportRunEventType, ImportRunStatus } from "@/gql/graphql";

import { ImportRunEventsService } from "./import-run-events.service";

describe("ImportRunEventsService", () => {
  it("claims and runs created events with status transitions", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: { id: "run-1" } } },
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
});

function createSetup({
  claimValue,
  executeImportRunError,
}: {
  claimValue: { data: { claimImportRun: null | { id: string } } };
  executeImportRunError?: Error;
}) {
  const claimImportRun = vi.fn().mockResolvedValue(claimValue);
  const updateImportRunStatus = vi.fn().mockResolvedValue({});
  const subscribeToImportRunEvents = vi.fn(
    (handler: (event: ReturnType<typeof createEvent>) => void) => {
      void handler;
      return { unsubscribe: vi.fn() };
    },
  );
  const apiService = {
    claimImportRun,
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
