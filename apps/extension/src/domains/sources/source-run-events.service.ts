import { tryRun } from "@job-tracker/try-run";

import type { ApiService } from "@/domains/api/api.service";
import type { ExtensionActivityReporterService } from "@/domains/extension-activity/extension-activity-reporter.service";
import type { LogService } from "@/domains/log/log.service";
import { mapCollectedJobToCreateJobInput } from "@/domains/plan/map-collected-job-to-create-job-input";
import type { PlanService } from "@/domains/plan/services/plan.service";
import { planForSourceRun } from "@/domains/sources/source-run-plan";
import { ExtensionActivityEventType, SourceRunStatus } from "@/gql/graphql";

export class SourceRunEventsService {
  constructor(
    private readonly apiService: ApiService,
    private readonly logService: LogService,
    private readonly planService: PlanService,
    private readonly activityReporter?: ExtensionActivityReporterService,
  ) {}

  async recoverOutstandingRuns(): Promise<void> {
    const [err, response] = await tryRun(this.apiService.sourceRuns());
    if (err) {
      this.logService.error("source-run:recovery-error", { error: err });
      return;
    }

    const outstandingRuns =
      response.data?.sourceRuns?.filter(
        (run) => run.status === SourceRunStatus.Pending,
      ) ?? [];

    for (const run of outstandingRuns) {
      await this.executeSourceRun({
        runId: run.id,
        surfaceUrl: run.surfaceUrl,
        planId: run.planId,
      });
    }
  }

  async executeSourceRun(params: unknown): Promise<void> {
    if (!isSourceRunStartMessage(params)) {
      this.logService.error("source-run:invalid-message", { params });
      return;
    }
    const { runId, surfaceUrl, planId } = params;

    this.activityReporter?.report(
      ExtensionActivityEventType.SourceRunStarted,
      surfaceUrl,
      { correlationId: runId },
    );

    const plan = planForSourceRun(planId);

    const [runErr] = await tryRun(
      (async () => {
        await this.planService.execute(plan, {
          surfaceUrl: surfaceUrl.trim(),
          onJobCollected: async (job) => {
            const input = {
              ...mapCollectedJobToCreateJobInput(job),
              sourceRunId: runId,
            };
            const [createErr] = await tryRun(this.apiService.createJob(input));
            if (createErr) {
              this.logService.error("source-run:create-job-failed", {
                runId,
                error: createErr,
                title: job.title,
              });
              return;
            }

            this.activityReporter?.report(
              ExtensionActivityEventType.SourceRunJobImported,
              typeof job.title === "string" && job.title.trim()
                ? job.title.trim()
                : surfaceUrl,
              { correlationId: runId },
            );
          },
        });
        await this.apiService.updateSourceRunStatus(
          runId,
          SourceRunStatus.Completed,
        );
      })(),
    );

    if (runErr) {
      const errorMessage =
        runErr instanceof Error ? runErr.message : String(runErr);
      await this.apiService.updateSourceRunStatus(
        runId,
        SourceRunStatus.Failed,
        errorMessage,
      );
      this.logService.error("source-run:execution-failed", {
        runId,
        error: runErr,
      });
      this.activityReporter?.report(
        ExtensionActivityEventType.SourceRunFailed,
        surfaceUrl,
        { correlationId: runId },
      );
      return;
    }

    this.activityReporter?.report(
      ExtensionActivityEventType.SourceRunCompleted,
      surfaceUrl,
      { correlationId: runId },
    );
  }
}

type SourceRunStartMessage = {
  runId: string;
  surfaceUrl: string;
  planId: string;
};

function isSourceRunStartMessage(
  message: unknown,
): message is SourceRunStartMessage {
  if (typeof message !== "object" || message === null) return false;
  const m = message as Record<string, unknown>;
  return (
    typeof m.runId === "string" &&
    typeof m.surfaceUrl === "string" &&
    typeof m.planId === "string"
  );
}
