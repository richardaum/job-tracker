import { afterEach, describe, expect, it, vi } from "vitest";

import type { CollectJobsAction } from "@job-tracker/plan-schemas";
import { StopWhen } from "@/gql/graphql";

import { CollectJobsService } from "./collect-jobs.service";
import { StringTemplateService } from "./string-template.service";

afterEach(() => {
  vi.restoreAllMocks();
});

function actionWithKey(
  template: string | undefined,
  surfaceFields?: Array<{ key: string; selector: string; type: string; value: string }>,
): CollectJobsAction {
  return {
    kind: "collect.jobs",
    input: {
      containerSelector: ".list",
      itemSelector: ".card",
      detailsUrlField: "detailUrl",
      ...(template != null ? { key: template } : {}),
      parallelDetailsTabs: 2,
      surfaceFields: surfaceFields ?? [],
      detailsFields: [],
    },
  } as unknown as CollectJobsAction;
}

function createMocks() {
  const jobsListMessaging = { listJobs: vi.fn().mockResolvedValue({ jobs: [] }) };
  const jobDetailsMessaging = { getJobDetails: vi.fn() };
  const paginationMessaging = { canNavigateToNextPage: vi.fn().mockResolvedValue(false), navigateToNextPage: vi.fn() };
  const tabManager = {
    openWindow: vi.fn().mockResolvedValue(10),
    getTabWindowId: vi.fn().mockResolvedValue(100),
    closeWindow: vi.fn().mockResolvedValue(undefined),
    waitUntilTabComplete: vi.fn().mockResolvedValue(undefined),
    openTab: vi.fn(),
    closeTab: vi.fn(),
    getCurrentTab: vi.fn(),
  };

  return { jobsListMessaging, jobDetailsMessaging, paginationMessaging, tabManager };
}

function createService(mocks: ReturnType<typeof createMocks>) {
  return new CollectJobsService(
    mocks.jobsListMessaging as never,
    mocks.jobDetailsMessaging as never,
    mocks.paginationMessaging as never,
    mocks.tabManager as never,
    new StringTemplateService(),
  );
}

describe("CollectJobsService", () => {
  describe("deduplication", () => {
    it("invokes onJobCollected once per dedupe key (same company-title)", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs.mockResolvedValue({
        jobs: [
          { company: "Acme", title: "Dev", detailUrl: "https://example.com/a" },
          { company: "Acme", title: "Dev", detailUrl: "https://example.com/b" },
        ],
      });

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      const result = await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        onJobCollected,
      });

      expect(onJobCollected).toHaveBeenCalledTimes(1);
      expect(result.size).toBe(1);
      expect(result.get("Acme-Dev")).toEqual(
        expect.objectContaining({ company: "Acme", title: "Dev", detailUrl: "https://example.com/b" }),
      );
    });

    it("invokes onJobCollected per distinct dedupe keys", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs.mockResolvedValue({
        jobs: [
          { company: "Acme", title: "A", detailUrl: "https://example.com/a" },
          { company: "Acme", title: "B", detailUrl: "https://example.com/b" },
        ],
      });

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        onJobCollected,
      });

      expect(onJobCollected).toHaveBeenCalledTimes(2);
    });
  });

  describe("CatchUp stop condition", () => {
    it("stops when consecutive duplicates reach threshold", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({
          jobs: [
            { company: "Acme", title: "Dev1", detailUrl: "https://example.com/1" },
            { company: "Acme", title: "Dev2", detailUrl: "https://example.com/2" },
          ],
        })
        .mockResolvedValueOnce({
          jobs: [
            { company: "Acme", title: "Dev3", detailUrl: "https://example.com/3" },
            { company: "Acme", title: "Dev4", detailUrl: "https://example.com/4" },
          ],
        })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev5", detailUrl: "https://example.com/5" }] });
      mocks.paginationMessaging.canNavigateToNextPage
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const onJobCollected = vi.fn().mockResolvedValue({ duplicate: true });

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.CatchUp,
        catchUpThreshold: 3,
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).toHaveBeenCalledTimes(1);
      expect(onJobCollected).toHaveBeenCalledTimes(4);
    });

    it("resets counter on non-duplicate", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev1", detailUrl: "https://example.com/1" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev2", detailUrl: "https://example.com/2" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev3", detailUrl: "https://example.com/3" }] });
      mocks.paginationMessaging.canNavigateToNextPage
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      let callCount = 0;
      const onJobCollected = vi.fn().mockImplementation(async () => {
        callCount++;
        return { duplicate: callCount <= 2 };
      });

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.CatchUp,
        catchUpThreshold: 3,
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).toHaveBeenCalledTimes(2);
    });

    it("continues when threshold not reached", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev1", detailUrl: "https://example.com/1" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev2", detailUrl: "https://example.com/2" }] });
      mocks.paginationMessaging.canNavigateToNextPage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const onJobCollected = vi.fn().mockResolvedValue({ duplicate: true });

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.CatchUp,
        catchUpThreshold: 5,
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).toHaveBeenCalledTimes(1);
    });
  });

  describe("FirstRunMaxPages stop condition", () => {
    it("stops exactly at maxPages", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev1", detailUrl: "https://example.com/1" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev2", detailUrl: "https://example.com/2" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev3", detailUrl: "https://example.com/3" }] });
      mocks.paginationMessaging.canNavigateToNextPage.mockResolvedValue(true);

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.FirstRunMaxPages,
        maxPages: 2,
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).toHaveBeenCalledTimes(1);
      expect(onJobCollected).toHaveBeenCalledTimes(2);
    });

    it("maxPages=1 stops after first page", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev1", detailUrl: "https://example.com/1" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev2", detailUrl: "https://example.com/2" }] });
      mocks.paginationMessaging.canNavigateToNextPage.mockResolvedValue(true);

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.FirstRunMaxPages,
        maxPages: 1,
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).not.toHaveBeenCalled();
      expect(onJobCollected).toHaveBeenCalledTimes(1);
    });
  });

  describe("OlderThan stop condition", () => {
    it("stops when all jobs on page are older than threshold", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);

      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs.mockResolvedValueOnce({
        jobs: [
          { company: "Acme", title: "Dev1", publishedAt: oldDate.toISOString(), detailUrl: "https://example.com/1" },
          { company: "Acme", title: "Dev2", publishedAt: oldDate.toISOString(), detailUrl: "https://example.com/2" },
        ],
      });
      mocks.paginationMessaging.canNavigateToNextPage.mockResolvedValueOnce(true);

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.OlderThan,
        olderThanDays: 30,
        publishedAtField: "publishedAt",
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).not.toHaveBeenCalled();
      expect(onJobCollected).toHaveBeenCalledTimes(2);
    });

    it("continues when jobs are recent enough", async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5);

      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({
          jobs: [
            {
              company: "Acme",
              title: "Dev1",
              publishedAt: recentDate.toISOString(),
              detailUrl: "https://example.com/1",
            },
          ],
        })
        .mockResolvedValueOnce({
          jobs: [
            {
              company: "Acme",
              title: "Dev2",
              publishedAt: recentDate.toISOString(),
              detailUrl: "https://example.com/2",
            },
          ],
        });
      mocks.paginationMessaging.canNavigateToNextPage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        stopWhen: StopWhen.OlderThan,
        olderThanDays: 30,
        publishedAtField: "publishedAt",
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).toHaveBeenCalledTimes(1);
    });
  });

  describe("no stop config (backward compat)", () => {
    it("scans all available pages when no stopWhen is provided", async () => {
      const mocks = createMocks();
      mocks.jobsListMessaging.listJobs
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev1", detailUrl: "https://example.com/1" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev2", detailUrl: "https://example.com/2" }] })
        .mockResolvedValueOnce({ jobs: [{ company: "Acme", title: "Dev3", detailUrl: "https://example.com/3" }] });
      mocks.paginationMessaging.canNavigateToNextPage
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const onJobCollected = vi.fn().mockResolvedValue(undefined);

      const service = createService(mocks);
      await service.execute(actionWithKey("{{company}}-{{title}}"), {
        surfaceUrl: "https://example.com/jobs",
        boardType: "Sequential",
        onJobCollected,
      });

      expect(mocks.paginationMessaging.navigateToNextPage).toHaveBeenCalledTimes(2);
      expect(onJobCollected).toHaveBeenCalledTimes(3);
    });
  });
});
