import { describe, expect, it, vi } from "vitest";

import type { ApiService } from "@/domains/api/api.service";
import type { LogService } from "@/domains/log/log.service";
import type { PlanService } from "@/domains/plan/services/plan.service";
import { SourceRunStatus } from "@/gql/graphql";

import { SourceRunEventsService } from "./source-run-events.service";

const REMOTEYEAH_SURFACE_URL =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide";

describe("SourceRunEventsService", () => {
  it("executes plan then COMPLETED", async () => {
    const setup = createSetup();

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );

    await service.executeSourceRun({
      runId: "run-1",
      surfaceUrl: REMOTEYEAH_SURFACE_URL,
      planId: "2e84cb8d-d9f2-4a02-947e-80909eb76709",
    });

    expect(setup.updateSourceRunStatus).toHaveBeenCalledTimes(1);
    expect(setup.updateSourceRunStatus).toHaveBeenCalledWith(
      "run-1",
      SourceRunStatus.Completed,
    );
    expect(setup.executePlan).toHaveBeenCalledTimes(1);
    const executeOptions = setup.executePlan.mock.calls[0]?.[1] as {
      surfaceUrl: string;
    };
    expect(executeOptions.surfaceUrl).toBe(REMOTEYEAH_SURFACE_URL);
  });

  it("marks run FAILED when execution throws", async () => {
    const setup = createSetup({ executePlanError: new Error("boom") });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );

    await service.executeSourceRun({
      runId: "run-1",
      surfaceUrl: REMOTEYEAH_SURFACE_URL,
      planId: "2e84cb8d-d9f2-4a02-947e-80909eb76709",
    });

    expect(setup.updateSourceRunStatus).toHaveBeenCalledTimes(1);
    expect(setup.updateSourceRunStatus).toHaveBeenCalledWith(
      "run-1",
      SourceRunStatus.Failed,
      "boom",
    );
  });

  it("recovers Pending runs on startup", async () => {
    const setup = createSetup({
      sourceRunsValue: {
        data: {
          sourceRuns: [
            createRun({ id: "run-1", status: SourceRunStatus.Pending }),
            createRun({ id: "run-2", status: SourceRunStatus.Pending }),
            createRun({ id: "run-3", status: SourceRunStatus.Completed }),
          ],
        },
      },
    });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );

    await service.recoverOutstandingRuns();

    expect(setup.executePlan).toHaveBeenCalledTimes(2);
    expect(setup.executePlan).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ surfaceUrl: REMOTEYEAH_SURFACE_URL }),
    );
  });

  it("handles recovery query errors gracefully", async () => {
    const setup = createSetup({
      sourceRunsValue: Promise.reject(new Error("network")),
    });

    const service = new SourceRunEventsService(
      setup.apiService,
      setup.logService,
      setup.planService,
    );

    await service.recoverOutstandingRuns();

    expect(setup.logService.error).toHaveBeenCalledWith(
      "source-run:recovery-error",
      expect.any(Object),
    );
    expect(setup.executePlan).not.toHaveBeenCalled();
  });
});

function createSetup({
  executePlanError,
  sourceRunsValue,
}: {
  executePlanError?: Error;
  sourceRunsValue?:
    | { data: { sourceRuns: Array<ReturnType<typeof createRun>> } }
    | Promise<never>;
} = {}) {
  const sourceRuns = vi.fn().mockImplementation(async () => {
    if (sourceRunsValue instanceof Promise)
      return await sourceRunsValue.catch((e: Error) => {
        throw e;
      });
    return sourceRunsValue ?? { data: { sourceRuns: [] } };
  });
  const updateSourceRunStatus = vi.fn().mockResolvedValue({});

  const apiService = {
    sourceRuns,
    updateSourceRunStatus,
    createJob: vi.fn().mockResolvedValue({}),
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
    executePlan,
    updateSourceRunStatus,
  };
}

function createRun({ id, status }: { id: string; status: SourceRunStatus }) {
  return {
    id,
    status,
    planId: "2e84cb8d-d9f2-4a02-947e-80909eb76709",
    surfaceUrl: REMOTEYEAH_SURFACE_URL,
  };
}
