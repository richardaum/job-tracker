import { describe, expect, it, vi } from "vitest";

import type { PlanStepAction } from "@/domains/plan/model/types";

import { CollectJobsService } from "./collect-jobs.service";
import { StringTemplateService } from "./string-template.service";

function actionWithKey(template: string | undefined): PlanStepAction {
  return {
    kind: "collect.jobs",
    input: {
      containerSector: ".list",
      itemSelector: ".card",
      detailsUrlField: "detailUrl",
      ...(template != null ? { key: template } : {}),
      parallelDetailsTabs: 2,
      surfaceFields: [],
      detailsFields: [],
    },
  } as unknown as PlanStepAction;
}

describe("CollectJobsService", () => {
  it("invokes onJobCollected once per dedupe key (same company-title)", async () => {
    const jobsListMessaging = {
      listJobs: vi.fn().mockResolvedValue([
        { company: "Acme", title: "Dev", detailUrl: "https://example.com/a" },
        { company: "Acme", title: "Dev", detailUrl: "https://example.com/b" },
      ]),
    };
    const jobDetailsMessaging = { getJobDetails: vi.fn() };
    const paginationMessaging = {
      canNavigateToNextPage: vi.fn().mockResolvedValue(false),
      navigateToNextPage: vi.fn(),
    };
    const tabManager = {
      openWindow: vi.fn().mockResolvedValue(10),
      getTabWindowId: vi.fn().mockResolvedValue(100),
      closeWindow: vi.fn().mockResolvedValue(undefined),
      waitUntilTabComplete: vi.fn().mockResolvedValue(undefined),
      openTab: vi.fn(),
      closeTab: vi.fn(),
      getCurrentTab: vi.fn(),
    };

    const onJobCollected = vi.fn().mockResolvedValue(undefined);

    const service = new CollectJobsService(
      jobsListMessaging as never,
      jobDetailsMessaging as never,
      paginationMessaging as never,
      tabManager as never,
      new StringTemplateService(),
    );

    const result = await service.execute(
      actionWithKey("{{company}}-{{title}}"),
      { surfaceUrl: "https://example.com/jobs", onJobCollected },
    );

    expect(onJobCollected).toHaveBeenCalledTimes(1);
    expect(result.size).toBe(1);
    expect(result.get("Acme-Dev")).toEqual(
      expect.objectContaining({
        company: "Acme",
        title: "Dev",
        detailUrl: "https://example.com/b",
      }),
    );
  });

  it("invokes onJobCollected per distinct dedupe keys", async () => {
    const jobsListMessaging = {
      listJobs: vi.fn().mockResolvedValue([
        { company: "Acme", title: "A", detailUrl: "https://example.com/a" },
        { company: "Acme", title: "B", detailUrl: "https://example.com/b" },
      ]),
    };
    const jobDetailsMessaging = { getJobDetails: vi.fn() };
    const paginationMessaging = {
      canNavigateToNextPage: vi.fn().mockResolvedValue(false),
      navigateToNextPage: vi.fn(),
    };
    const tabManager = {
      openWindow: vi.fn().mockResolvedValue(11),
      getTabWindowId: vi.fn().mockResolvedValue(101),
      closeWindow: vi.fn().mockResolvedValue(undefined),
      waitUntilTabComplete: vi.fn().mockResolvedValue(undefined),
      openTab: vi.fn(),
      closeTab: vi.fn(),
      getCurrentTab: vi.fn(),
    };

    const onJobCollected = vi.fn().mockResolvedValue(undefined);

    const service = new CollectJobsService(
      jobsListMessaging as never,
      jobDetailsMessaging as never,
      paginationMessaging as never,
      tabManager as never,
      new StringTemplateService(),
    );

    await service.execute(actionWithKey("{{company}}-{{title}}"), {
      surfaceUrl: "https://example.com/jobs",
      onJobCollected,
    });

    expect(onJobCollected).toHaveBeenCalledTimes(2);
  });
});
