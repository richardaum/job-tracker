import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LogService } from "@/domains/log/log.service";
import type { PlanService } from "@/domains/plan/services/plan.service";
import { SourceRunStatus } from "@/gql/graphql";

import { SourceRunEventsService } from "./source-run-events.service";

const REMOTEYEAH_SURFACE_URL =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide";

const mockSourceRuns = vi.fn();
const mockUpdateSourceRunStatus = vi.fn();
const mockCreateJob = vi.fn();
const mockPlan = vi.fn();
const mockIsJobDuplicate = vi.fn();

vi.mock("@/gql/api", () => ({
  api: {
    SourceRuns: (...args: unknown[]) => mockSourceRuns(...args),
    UpdateSourceRunStatus: (...args: unknown[]) => mockUpdateSourceRunStatus(...args),
    CreateJob: (...args: unknown[]) => mockCreateJob(...args),
    Plan: (...args: unknown[]) => mockPlan(...args),
    IsJobDuplicate: (...args: unknown[]) => mockIsJobDuplicate(...args),
  },
}));

const PLAN_DOCUMENT = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  boardType: "Sequential" as const,
  steps: [
    {
      id: "step-collect",
      action: {
        kind: "collect.jobs" as const,
        input: {
          containerSelector: ".list",
          itemSelector: ".item",
          detailsUrlField: "detailUrl",
          detailsFields: [],
          surfaceFields: [
            { key: "title", selector: ".title", type: "property" as const, value: "textContent" as const },
            { key: "detailUrl", selector: "a.link", type: "attribute" as const, value: "href" as const },
            { key: "publishedAt", selector: ".date", type: "property" as const, value: "textContent" as const },
          ],
        },
      },
    },
  ],
};

describe("SourceRunEventsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlan.mockResolvedValue({ plan: { id: "plan-1", displayName: "Test", document: PLAN_DOCUMENT } });
  });

  it("executes plan then COMPLETED", async () => {
    const setup = createSetup();

    const service = new SourceRunEventsService(setup.logService, setup.planService);

    await service.executeSourceRun({
      runId: "run-1",
      surfaceUrl: REMOTEYEAH_SURFACE_URL,
      planId: "2e84cb8d-d9f2-4a02-947e-80909eb76709",
    });

    expect(mockUpdateSourceRunStatus).toHaveBeenCalledTimes(1);
    expect(mockUpdateSourceRunStatus).toHaveBeenCalledWith({ id: "run-1", status: SourceRunStatus.Completed });
    expect(setup.executePlan).toHaveBeenCalledTimes(1);
    const executeOptions = setup.executePlan.mock.calls[0]?.[1] as { surfaceUrl: string };
    expect(executeOptions.surfaceUrl).toBe(REMOTEYEAH_SURFACE_URL);
  });

  it("marks run FAILED when execution throws", async () => {
    const setup = createSetup({ executePlanError: new Error("boom") });

    const service = new SourceRunEventsService(setup.logService, setup.planService);

    await service.executeSourceRun({
      runId: "run-1",
      surfaceUrl: REMOTEYEAH_SURFACE_URL,
      planId: "2e84cb8d-d9f2-4a02-947e-80909eb76709",
    });

    expect(mockUpdateSourceRunStatus).toHaveBeenCalledTimes(1);
    expect(mockUpdateSourceRunStatus).toHaveBeenCalledWith({
      id: "run-1",
      status: SourceRunStatus.Failed,
      errorMessage: "boom",
    });
  });

  it("recovers Pending runs on startup", async () => {
    const setup = createSetup({
      sourceRunsValue: {
        sourceRuns: [
          createRun({ id: "run-1", status: SourceRunStatus.Pending }),
          createRun({ id: "run-2", status: SourceRunStatus.Pending }),
          createRun({ id: "run-3", status: SourceRunStatus.Completed }),
        ],
      },
    });

    const service = new SourceRunEventsService(setup.logService, setup.planService);

    await service.recoverOutstandingRuns();

    expect(setup.executePlan).toHaveBeenCalledTimes(2);
    expect(setup.executePlan).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ surfaceUrl: REMOTEYEAH_SURFACE_URL }),
    );
  });

  it("handles recovery query errors gracefully", async () => {
    const setup = createSetup({ sourceRunsValue: Promise.reject(new Error("network")) });

    const service = new SourceRunEventsService(setup.logService, setup.planService);

    await service.recoverOutstandingRuns();

    expect(setup.logService.error).toHaveBeenCalledWith("source-run:recovery-error", expect.any(Object));
    expect(setup.executePlan).not.toHaveBeenCalled();
  });
});

function createSetup({
  executePlanError,
  sourceRunsValue,
}: {
  executePlanError?: Error;
  sourceRunsValue?: { sourceRuns: Array<ReturnType<typeof createRun>> } | Promise<never>;
} = {}) {
  mockSourceRuns.mockImplementation(async () => {
    if (sourceRunsValue instanceof Promise)
      return await sourceRunsValue.catch((e: Error) => {
        throw e;
      });
    return sourceRunsValue ?? { sourceRuns: [] };
  });
  mockUpdateSourceRunStatus.mockResolvedValue(undefined);
  mockIsJobDuplicate.mockResolvedValue({ isJobDuplicate: false });
  mockCreateJob.mockResolvedValue({ createJob: { id: "job-1", title: "Test" } });

  const executePlan = vi.fn();
  if (executePlanError) {
    executePlan.mockRejectedValue(executePlanError);
  } else {
    executePlan.mockResolvedValue(undefined);
  }
  const planService = { execute: executePlan } as unknown as PlanService;
  const logService = { debug: vi.fn(), error: vi.fn() } as unknown as LogService;

  return { planService, logService, executePlan };
}

function createRun({ id, status }: { id: string; status: SourceRunStatus }) {
  return { id, status, planId: "2e84cb8d-d9f2-4a02-947e-80909eb76709", surfaceUrl: REMOTEYEAH_SURFACE_URL };
}
