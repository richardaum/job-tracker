import { tryRun } from "@job-tracker/try-run";
import { parsePlan } from "@job-tracker/plan-schemas";

import { api } from "@/gql/api";
import type { ExtensionActivityReporterService } from "@/domains/extension-activity/extension-activity-reporter.service";
import type { LogService } from "@/domains/log/log.service";
import { mapCollectedJobToCreateJobInput } from "@/domains/plan/map-collected-job-to-create-job-input";
import type { CollectJobsStepInput, Plan } from "@job-tracker/plan-schemas";
import type { PlanService } from "@/domains/plan/services/plan.service";
import { ExtensionActivityEventType, type SourceRunType, SourceRunStatus } from "@/gql/graphql";

export class SourceRunEventsService {
  constructor(
    private readonly logService: LogService,
    private readonly planService: PlanService,
    private readonly activityReporter?: ExtensionActivityReporterService,
  ) {}

  async recoverOutstandingRuns(): Promise<void> {
    const [err, response] = await tryRun(api.SourceRuns());
    if (err) {
      this.logService.error("source-run:recovery-error", { error: err });
      return;
    }

    const outstandingRuns = response.sourceRuns?.filter((run) => run.status === SourceRunStatus.Pending) ?? [];

    for (const run of outstandingRuns) {
      await this.executeSourceRun({
        runId: run.id,
        surfaceUrl: run.surfaceUrl,
        planId: run.planId,
        stopWhen: run.stopWhen,
        catchUpThreshold: run.catchUpThreshold,
        maxPages: run.maxPages,
        olderThanDays: run.olderThanDays,
      });
    }
  }

  async executeSourceRun(params: unknown): Promise<void> {
    if (!isSourceRunStartMessage(params)) {
      this.logService.error("source-run:invalid-message", { params });
      return;
    }
    const { runId, surfaceUrl, planId, stopWhen, catchUpThreshold, maxPages, olderThanDays } = params;

    this.activityReporter?.report(ExtensionActivityEventType.SourceRunStarted, surfaceUrl, { sourceRunId: runId });

    const [planErr, planResult] = await tryRun(api.Plan({ id: planId }));

    if (planErr || !planResult.plan) {
      const msg = planErr?.message ?? "plan not found";
      this.logService.error("source-run:plan-fetch-failed", { planId, error: msg });
      await api.UpdateSourceRunStatus({
        id: runId,
        status: SourceRunStatus.Failed,
        errorMessage: `Failed to fetch plan: ${msg}`,
      });
      this.activityReporter?.report(ExtensionActivityEventType.SourceRunFailed, surfaceUrl, { sourceRunId: runId });
      return;
    }

    const plan = parsePlan({ id: planResult.plan.id, ...planResult.plan.document });
    const publishedAtField = getPublishedAtFieldName(plan);

    const [runErr] = await tryRun(
      (async () => {
        await this.planService.execute(plan, {
          surfaceUrl: surfaceUrl.trim(),
          boardType: plan.boardType,
          sourceRunId: runId,
          stopWhen: stopWhen ?? undefined,
          catchUpThreshold: catchUpThreshold ?? undefined,
          maxPages: maxPages ?? undefined,
          olderThanDays: olderThanDays ?? undefined,
          publishedAtField,
          onJobCollected: async (job) => {
            const company = typeof job.company === "string" ? job.company : "";
            const title = typeof job.title === "string" ? job.title : "";
            const [dupErr, dupData] = await tryRun(api.IsJobDuplicate({ company, title }));
            const isDuplicate = !dupErr && (dupData?.isJobDuplicate ?? false);

            if (dupErr) {
              this.logService.warn?.("source-run:is-job-duplicate-failed", { runId, error: dupErr, company, title });
            }

            if (!isDuplicate) {
              const input = { ...mapCollectedJobToCreateJobInput(job), sourceRunId: runId };
              const [createErr] = await tryRun(api.CreateJob({ input }));
              if (createErr) {
                this.logService.error("source-run:create-job-failed", { runId, error: createErr, title: job.title });
                return { duplicate: false };
              }
            }

            this.activityReporter?.report(
              ExtensionActivityEventType.SourceRunJobDetailsImport,
              typeof job.title === "string" && job.title.trim() ? job.title.trim() : surfaceUrl,
              { sourceRunId: runId, payload: { duplicate: isDuplicate } },
            );

            return { duplicate: isDuplicate };
          },
          onPageCollected: async (page, jobCount) => {
            this.activityReporter?.report(
              ExtensionActivityEventType.SourceRunPageCollected,
              `Page ${page} · ${jobCount} jobs`,
              { sourceRunId: runId },
            );
          },
          onStopConditionMet: async (page, reason) => {
            this.activityReporter?.report(
              ExtensionActivityEventType.SourceRunStopConditionMet,
              `Page ${page}: ${reason}`,
              { sourceRunId: runId },
            );
          },
        });
        await api.UpdateSourceRunStatus({ id: runId, status: SourceRunStatus.Completed });
      })(),
    );

    if (runErr) {
      const errorMessage = runErr instanceof Error ? runErr.message : String(runErr);
      await api.UpdateSourceRunStatus({ id: runId, status: SourceRunStatus.Failed, errorMessage });
      this.logService.error("source-run:execution-failed", { runId, error: runErr });
      this.activityReporter?.report(ExtensionActivityEventType.SourceRunFailed, surfaceUrl, { sourceRunId: runId });
      return;
    }

    this.activityReporter?.report(ExtensionActivityEventType.SourceRunCompleted, surfaceUrl, { sourceRunId: runId });
  }
}

function getPublishedAtFieldName(plan: Plan): string | undefined {
  for (const step of plan.steps) {
    if (step.action.kind !== "collect.jobs") continue;
    const input = step.action.input as CollectJobsStepInput;
    const field = input.surfaceFields?.find((f) => f.key === "publishedAt");
    if (field) return field.key;
  }
  return undefined;
}

type SourceRunStartMessage = {
  runId: string;
  surfaceUrl: string;
  planId: string;
  stopWhen?: SourceRunType["stopWhen"];
  catchUpThreshold?: SourceRunType["catchUpThreshold"];
  maxPages?: SourceRunType["maxPages"];
  olderThanDays?: SourceRunType["olderThanDays"];
};

function isSourceRunStartMessage(message: unknown): message is SourceRunStartMessage {
  if (typeof message !== "object" || message === null) return false;
  const m = message as Record<string, unknown>;
  return typeof m.runId === "string" && typeof m.surfaceUrl === "string" && typeof m.planId === "string";
}
