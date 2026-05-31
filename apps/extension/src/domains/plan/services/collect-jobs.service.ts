import pLimit from "p-limit";

import type { Job } from "@/domains/dom/types";
import { JobDetailsMessagingService } from "@/domains/job-details/job-details-messaging.service";
import { JobsListMessagingService } from "@/domains/jobs-list/jobs-list-messaging.service";
import { LogService } from "@/domains/log/log.service";
import { PaginationMessagingService } from "@/domains/pagination/pagination-messaging.service";
import type { CollectJobsAction } from "@/domains/plan/model/types";
import type { PlanExecuteOptions } from "@/domains/plan/plan-execute-options";
import { StopWhen } from "@/gql/graphql";
import { TabService } from "@/domains/tab/types";

import { StringTemplateService } from "./string-template.service";

const logService = new LogService({
  prefix: "CollectJobsService",
  level: "debug",
});

/**
 * A maximum number of pages to collect jobs from.
 * Prevent infinite loops in case the pagination is not working correctly.
 */
const MAX_PAGES = 50;

/**
 * A maximum number of detail tabs to open concurrently.
 */
const MAX_TABS = 20;

/**
 * Collect jobs from a surface page and fetch details for each job.
 *
 * Flow:
 *   - open the surface in a new window
 *   - list jobs (fetch fields according to surfaceFields)
 *   - for each job, open the detail tab
 *   - fetch details (fetch fields according to detailsFields)
 *   - close the detail tab
 *   - close the surface window
 *   - return the jobs
 *
 * `PlanExecuteOptions.onJobCollected` runs at most once per {@link CollectJobsService.generateJobKey},
 * aligned with deduplication in the returned {@link Map}.
 */
export class CollectJobsService {
  constructor(
    private readonly jobsListMessaging: JobsListMessagingService,
    private readonly jobDetailsMessaging: JobDetailsMessagingService,
    private readonly paginationMessaging: PaginationMessagingService,
    private readonly tabManager: TabService,
    private readonly stringTemplateService: StringTemplateService,
  ) {}

  async execute(action: CollectJobsAction, options: PlanExecuteOptions) {
    const surfaceTabId = await this.tabManager.openWindow(options.surfaceUrl, {
      focus: true,
    });
    const surfaceWindowId = await this.tabManager.getTabWindowId(surfaceTabId);

    const jobs: Map<string, Job> = new Map();
    let consecutiveDuplicates = 0;

    try {
      const limitDetailTabs = pLimit(Math.min(action.input.parallelDetailsTabs, MAX_TABS));

      for (let iteration = 1; iteration <= MAX_PAGES; iteration += 1) {
        const list = await this.jobsListMessaging.listJobs(action, surfaceTabId);

        if (list == null) {
          throw new Error("listJobs returned null (content script unavailable)");
        }

        await Promise.all(
          list.map((job) =>
            limitDetailTabs(async () => {
              const jobWithDetails = await this.collectJobDetails(action, job, surfaceWindowId);
              const key = this.generateJobKey(action, jobWithDetails);
              const firstVisit = !jobs.has(key);
              jobs.set(key, jobWithDetails);
              if (firstVisit) {
                const result = await options?.onJobCollected?.(jobWithDetails);
                if (result && "duplicate" in result) {
                  if (result.duplicate) {
                    consecutiveDuplicates += 1;
                  } else {
                    consecutiveDuplicates = 0;
                  }
                }
              }
            }),
          ),
        );

        await options?.onPageCollected?.(iteration, jobs.size);

        if (this.shouldStopAfterPage(iteration, options, consecutiveDuplicates, list)) {
          const stopReason = this.formatStopReason(iteration, options, consecutiveDuplicates);
          logService.debug("collect-jobs:stop-condition-met", {
            iteration,
            stopWhen: options.stopWhen,
            consecutiveDuplicates,
            stopReason,
          });
          await options?.onStopConditionMet?.(iteration, stopReason);
          break;
        }

        const canNavigate = await this.paginationMessaging.canNavigateToNextPage(
          action,
          surfaceTabId,
        );
        if (!canNavigate) break;

        await this.paginationMessaging.navigateToNextPage(action, surfaceTabId);
        await this.tabManager.waitUntilTabComplete(surfaceTabId);
      }

      return jobs;
    } finally {
      await this.tabManager.closeWindow(surfaceTabId);
    }
  }

  private shouldStopAfterPage(
    page: number,
    opts: PlanExecuteOptions,
    consecutiveDupes: number,
    pageJobs: Job[],
  ): boolean {
    const conditions = typeof opts.stopWhen === "string" ? [opts.stopWhen] : (opts.stopWhen ?? []);
    return conditions.some((sw) =>
      this.evaluateStopCondition(sw, page, opts, consecutiveDupes, pageJobs),
    );
  }

  private evaluateStopCondition(
    sw: StopWhen,
    page: number,
    opts: PlanExecuteOptions,
    consecutiveDupes: number,
    pageJobs: Job[],
  ): boolean {
    switch (sw) {
      case StopWhen.CatchUp:
        return (
          opts.boardType === "Sequential" && consecutiveDupes >= (opts.catchUpThreshold ?? Infinity)
        );
      case StopWhen.FirstRunMaxPages:
        return page >= (opts.maxPages ?? 1);
      case StopWhen.OlderThan: {
        if (opts.publishedAtField == null || opts.olderThanDays == null) {
          return false;
        }
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - opts.olderThanDays);
        return pageJobs.every((job) => {
          const raw = job[opts.publishedAtField!];
          if (raw == null) return false;
          const d = new Date(String(raw));
          if (isNaN(d.getTime())) return false;
          return d < cutoff;
        });
      }
    }
  }

  private formatStopReason(
    page: number,
    opts: PlanExecuteOptions,
    consecutiveDupes: number,
  ): string {
    switch (opts.stopWhen) {
      case "CatchUp":
        return `CatchUp: consecutiveDuplicates=${consecutiveDupes} >= threshold=${opts.catchUpThreshold}`;
      case "FirstRunMaxPages":
        return `FirstRunMaxPages: page=${page} >= maxPages=${opts.maxPages}`;
      case "OlderThan":
        return `OlderThan: page=${page} olderThanDays=${opts.olderThanDays}`;
      default:
        return "no-stop-condition";
    }
  }

  private async collectJobDetails(action: CollectJobsAction, job: Job, surfaceWindowId: number) {
    if (action.input.detailsFields.length === 0) return job;

    const detailUrl = job[action.input.detailsUrlField] as string;
    if (detailUrl == null) return job;

    const detailTabId = await this.tabManager.openTab(detailUrl, {
      windowId: surfaceWindowId,
    });
    const details = await this.jobDetailsMessaging.getJobDetails(action, detailTabId);

    logService.debug("Job details collected", { details });

    const jobWithDetails = { ...job, ...details };
    await this.tabManager.closeTab(detailTabId);
    return jobWithDetails;
  }

  private generateJobKey(action: CollectJobsAction, job: Job): string {
    const keyTemplate = action.input.key;
    if (keyTemplate != null && keyTemplate.trim().length > 0) {
      const parsedKey = this.stringTemplateService.parse(keyTemplate, job);
      if (parsedKey.length > 0) return parsedKey;
    }

    const detailUrl = job[action.input.detailsUrlField];
    if (typeof detailUrl === "string" && detailUrl.trim().length > 0) {
      return detailUrl.trim();
    }

    return JSON.stringify(job);
  }
}
