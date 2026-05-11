import { describe, expect, it, vi } from "vitest";

import type { ApiService } from "@/domains/api/api.service";
import type { LogService } from "@/domains/log/log.service";
import type { PlanService } from "@/domains/plan/services/plan.service";
import { ImportRunEventType, ImportRunStatus } from "@/gql/graphql";

import { ImportRunEventsService } from "./import-run-events.service";

const REMOTEYEAH_SURFACE_URL_FROM_PLAN =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide";

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
      setup.planService,
    );
    service.start();

    await vi.waitFor(() => {
      expect(setup.claimImportRun).toHaveBeenCalledWith("run-1");
    });
    expect(setup.claimImportRun).not.toHaveBeenCalledWith("run-2");
    expect(setup.executePlan).toHaveBeenCalledTimes(1);
    const calledPlan = setup.executePlan.mock.calls[0]?.[0] as {
      steps: Array<{ action: { input: { surfaceUrl: string } } }>;
    };
    expect(calledPlan.steps[0].action.input.surfaceUrl).toBe(
      REMOTEYEAH_SURFACE_URL_FROM_PLAN,
    );
  });

  it("does not fail startup when recovery query fails", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: null } },
      importRunsValue: Promise.reject(new Error("network")),
    });
    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );

    expect(() => service.start()).not.toThrow();
    await vi.waitFor(() => {
      expect(setup.logService.error).toHaveBeenCalledWith(
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
      setup.planService,
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
    expect(setup.executePlan).toHaveBeenCalledTimes(1);
    const calledPlan = setup.executePlan.mock.calls[0]?.[0] as {
      steps: Array<{ action: { input: { surfaceUrl: string } } }>;
    };
    expect(calledPlan.steps[0].action.input.surfaceUrl).toBe(
      REMOTEYEAH_SURFACE_URL_FROM_PLAN,
    );
  });

  it("skips execution when claim fails", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: null } },
      importRunsValue: { data: { importRuns: [] } },
    });

    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );
    service.start();

    setup.emitEvent(createEvent(ImportRunEventType.ImportRunCreated));
    await vi.waitFor(() => {
      expect(setup.claimImportRun).toHaveBeenCalledWith("run-1");
    });
    expect(setup.updateImportRunStatus).not.toHaveBeenCalled();
    expect(setup.executePlan).not.toHaveBeenCalled();
  });

  it("marks run failed when execution throws", async () => {
    const setup = createSetup({
      claimValue: { data: { claimImportRun: { id: "run-1" } } },
      executePlanError: new Error("boom"),
      importRunsValue: { data: { importRuns: [] } },
    });

    const service = new ImportRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
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
      setup.planService,
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
      updateImportRunSurfaceUrl: vi.fn().mockResolvedValue({}),
      subscribeToImportRunEvents,
    } as unknown as ApiService;

    const executeA = vi.fn().mockResolvedValue(undefined);
    const executeB = vi.fn().mockResolvedValue(undefined);
    const logA = { debug: vi.fn(), error: vi.fn() } as unknown as LogService;
    const logB = { debug: vi.fn(), error: vi.fn() } as unknown as LogService;

    const serviceA = new ImportRunEventsService(apiService, logA, {
      execute: executeA,
    } as unknown as PlanService);
    const serviceB = new ImportRunEventsService(apiService, logB, {
      execute: executeB,
    } as unknown as PlanService);

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
  executePlanError,
  importRunsValue,
}: {
  claimValue: { data: { claimImportRun: null | { id: string } } };
  executePlanError?: Error;
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
    updateImportRunSurfaceUrl: vi.fn().mockResolvedValue({}),
    subscribeToImportRunEvents,
  } as unknown as ApiService;
  const executePlan = vi.fn();
  if (executePlanError) {
    executePlan.mockRejectedValue(executePlanError);
  } else {
    executePlan.mockResolvedValue(undefined);
  }
  const planService = { execute: executePlan } as unknown as PlanService;
  const logService = {
    debug: vi.fn(),
    error: vi.fn(),
  } as unknown as LogService;

  return {
    apiService,
    planService,
    logService,
    claimImportRun,
    executePlan,
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
    importerId: "remoteyeah",
    status,
    startedAt: new Date().toISOString(),
    importerSource: "test",
  };
}
