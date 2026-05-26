import { describe, expect, it, vi } from "vitest";

import type { ApiService } from "@/domains/api/api.service";
import type { LogService } from "@/domains/log/log.service";
import type { PlanService } from "@/domains/plan/services/plan.service";
import { SourceRunEventType, SourceRunStatus } from "@/gql/graphql";

import { SourceRunEventsService } from "./source-run-events.service";

const REMOTEYEAH_SURFACE_URL =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide";

describe("SourceRunEventsService", () => {
  it("attempts startup recovery for RUNNING runs", async () => {
    const setup = createSetup({
      claimValue: { data: { claimSourceRun: { id: "run-1" } } },
      sourceRunsValue: {
        data: {
          sourceRuns: [
            createRun({ id: "run-1", status: SourceRunStatus.Running }),
            createRun({ id: "run-2", status: SourceRunStatus.Completed }),
          ],
        },
      },
    });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );
    service.start();

    await vi.waitFor(() => {
      expect(setup.claimSourceRun).toHaveBeenCalledWith("run-1");
    });
    expect(setup.claimSourceRun).not.toHaveBeenCalledWith("run-2");
    expect(setup.executePlan).toHaveBeenCalledTimes(1);
    const executeOptions = setup.executePlan.mock.calls[0]?.[1] as {
      surfaceUrl: string;
    };
    expect(executeOptions.surfaceUrl).toBe(REMOTEYEAH_SURFACE_URL);
  });

  it("does not fail startup when recovery query fails", async () => {
    const setup = createSetup({
      claimValue: { data: { claimSourceRun: null } },
      sourceRunsValue: Promise.reject(new Error("network")),
    });
    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );

    expect(() => service.start()).not.toThrow();
    await vi.waitFor(() => {
      expect(setup.logService.error).toHaveBeenCalledWith(
        "source-run-events:recovery-error",
        expect.any(Object),
      );
    });
  });

  it("claims and runs created events with status transitions", async () => {
    const setup = createSetup({
      claimValue: { data: { claimSourceRun: { id: "run-1" } } },
      sourceRunsValue: { data: { sourceRuns: [] } },
    });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );
    service.start();

    setup.emitEvent(createEvent(SourceRunEventType.SourceRunCreated));
    await vi.waitFor(() => {
      expect(setup.updateSourceRunStatus).toHaveBeenNthCalledWith(
        1,
        "run-1",
        SourceRunStatus.InProgress,
      );
      expect(setup.updateSourceRunStatus).toHaveBeenNthCalledWith(
        2,
        "run-1",
        SourceRunStatus.Completed,
      );
    });
    expect(setup.executePlan).toHaveBeenCalledTimes(1);
    const executeOptions = setup.executePlan.mock.calls[0]?.[1] as {
      surfaceUrl: string;
    };
    expect(executeOptions.surfaceUrl).toBe(REMOTEYEAH_SURFACE_URL);
  });

  it("skips execution when claim fails", async () => {
    const setup = createSetup({
      claimValue: { data: { claimSourceRun: null } },
      sourceRunsValue: { data: { sourceRuns: [] } },
    });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );
    service.start();

    setup.emitEvent(createEvent(SourceRunEventType.SourceRunCreated));
    await vi.waitFor(() => {
      expect(setup.claimSourceRun).toHaveBeenCalledWith("run-1");
    });
    expect(setup.updateSourceRunStatus).not.toHaveBeenCalled();
    expect(setup.executePlan).not.toHaveBeenCalled();
  });

  it("marks run failed when execution throws", async () => {
    const setup = createSetup({
      claimValue: { data: { claimSourceRun: { id: "run-1" } } },
      executePlanError: new Error("boom"),
      sourceRunsValue: { data: { sourceRuns: [] } },
    });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );
    service.start();

    setup.emitEvent(createEvent(SourceRunEventType.SourceRunCreated));
    await vi.waitFor(() => {
      expect(setup.updateSourceRunStatus).toHaveBeenNthCalledWith(
        1,
        "run-1",
        SourceRunStatus.InProgress,
      );
      expect(setup.updateSourceRunStatus).toHaveBeenNthCalledWith(
        2,
        "run-1",
        SourceRunStatus.Failed,
      );
    });
  });

  it("ignores unknown events safely", async () => {
    const setup = createSetup({
      claimValue: { data: { claimSourceRun: null } },
      sourceRunsValue: { data: { sourceRuns: [] } },
    });
    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );
    service.start();

    setup.emitEvent(createEvent("UNKNOWN_EVENT"));
    await Promise.resolve();

    expect(setup.claimSourceRun).not.toHaveBeenCalled();
    expect(setup.updateSourceRunStatus).not.toHaveBeenCalled();
  });

  it("ensures only one extension instance executes claimed run", async () => {
    const claimSourceRun = vi
      .fn()
      .mockResolvedValueOnce({ data: { claimSourceRun: { id: "run-1" } } })
      .mockResolvedValueOnce({ data: { claimSourceRun: null } });
    const sourceRuns = vi.fn().mockResolvedValue({ data: { sourceRuns: [] } });
    const updateSourceRunStatus = vi.fn().mockResolvedValue({});

    const handlers: Array<(event: ReturnType<typeof createEvent>) => void> = [];
    const subscribeToSourceRunEvents = vi.fn(
      (handler: (event: ReturnType<typeof createEvent>) => void) => {
        handlers.push(handler);
        return { unsubscribe: vi.fn() };
      },
    );

    const apiService = {
      claimSourceRun,
      sourceRuns,
      updateSourceRunStatus,
      updateSourceRunSurfaceUrl: vi.fn().mockResolvedValue({}),
      subscribeToSourceRunEvents,
    } as unknown as ApiService;

    const executeA = vi.fn().mockResolvedValue(undefined);
    const executeB = vi.fn().mockResolvedValue(undefined);
    const logA = { debug: vi.fn(), error: vi.fn() } as unknown as LogService;
    const logB = { debug: vi.fn(), error: vi.fn() } as unknown as LogService;

    const serviceA = new SourceRunEventsService(apiService, logA, {
      execute: executeA,
    } as unknown as PlanService);
    const serviceB = new SourceRunEventsService(apiService, logB, {
      execute: executeB,
    } as unknown as PlanService);

    serviceA.start();
    serviceB.start();

    const event = createEvent(SourceRunEventType.SourceRunCreated);
    handlers[0]?.(event);
    handlers[1]?.(event);

    await vi.waitFor(() => {
      expect(claimSourceRun).toHaveBeenCalledTimes(2);
    });
    await vi.waitFor(() => {
      expect(updateSourceRunStatus).toHaveBeenNthCalledWith(
        1,
        "run-1",
        SourceRunStatus.InProgress,
      );
      expect(updateSourceRunStatus).toHaveBeenNthCalledWith(
        2,
        "run-1",
        SourceRunStatus.Completed,
      );
    });

    expect(executeA.mock.calls.length + executeB.mock.calls.length).toBe(1);
    expect(updateSourceRunStatus).toHaveBeenCalledTimes(2);
  });
});

function createSetup({
  claimValue,
  executePlanError,
  sourceRunsValue,
}: {
  claimValue: { data: { claimSourceRun: null | { id: string } } };
  executePlanError?: Error;
  sourceRunsValue:
    | { data: { sourceRuns: Array<ReturnType<typeof createRun>> } }
    | Promise<never>;
}) {
  const claimSourceRun = vi.fn().mockResolvedValue(claimValue);
  const sourceRuns = vi.fn().mockImplementation(async () => {
    return await sourceRunsValue;
  });
  const updateSourceRunStatus = vi.fn().mockResolvedValue({});
  const subscribeToSourceRunEvents = vi.fn(
    (handler: (event: ReturnType<typeof createEvent>) => void) => {
      void handler;
      return { unsubscribe: vi.fn() };
    },
  );
  const apiService = {
    claimSourceRun,
    sourceRuns,
    updateSourceRunStatus,
    updateSourceRunSurfaceUrl: vi.fn().mockResolvedValue({}),
    subscribeToSourceRunEvents,
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
    claimSourceRun,
    executePlan,
    updateSourceRunStatus,
    emitEvent(event: ReturnType<typeof createEvent>) {
      const maybeHandler = subscribeToSourceRunEvents.mock.calls[0]?.[0];
      if (!maybeHandler) {
        throw new Error("expected subscription event handler");
      }
      (maybeHandler as (value: ReturnType<typeof createEvent>) => void)(event);
    },
  };
}

function createEvent(type: SourceRunEventType | string) {
  return {
    type,
    occurredAt: new Date().toISOString(),
    run: createRun({ id: "run-1", status: SourceRunStatus.Running }),
  };
}

function createRun({ id, status }: { id: string; status: SourceRunStatus }) {
  return {
    id,
    status,
    sourceProfileId: "remoteyeah",
    sourceProfile: "database",
    surfaceUrl: REMOTEYEAH_SURFACE_URL,
  };
}
