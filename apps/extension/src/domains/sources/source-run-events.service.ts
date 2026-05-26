import { tryRun } from "@job-tracker/try-run";

import type {
  ApiService,
  SourceRunEventHandler,
} from "@/domains/api/api.service";
import type { ExtensionActivityReporterService } from "@/domains/extension-activity/extension-activity-reporter.service";
import type { LogService } from "@/domains/log/log.service";
import { mapCollectedJobToCreateJobInput } from "@/domains/plan/map-collected-job-to-create-job-input";
import type { PlanService } from "@/domains/plan/services/plan.service";
import {
  planForSourceRun,
  surfaceUrlFromPlan,
} from "@/domains/sources/source-run-plan";
import {
  ExtensionActivityEventType,
  type SourceRunEventsSubscription,
  SourceRunEventType,
  SourceRunStatus,
} from "@/gql/graphql";

type SubscriptionHandle = { unsubscribe: () => void };
type SourceRunEvent = SourceRunEventsSubscription["sourceRunEvents"];

function sourceRunActivitySummary(run: SourceRunEvent["run"]): string {
  const profile = run.sourceProfile.trim();
  const surfaceUrl = run.surfaceUrl.trim();

  if (profile && surfaceUrl) return `${profile} · ${surfaceUrl}`;
  if (profile) return profile;
  if (surfaceUrl) return surfaceUrl;
  return run.sourceProfileId;
}

export class SourceRunEventsService {
  private subscription: SubscriptionHandle | null = null;
  private readonly handlers = new Set<SourceRunEventHandler>();

  constructor(
    private readonly apiService: ApiService,
    private readonly logService: LogService,
    private readonly planService: PlanService,
    private readonly activityReporter?: ExtensionActivityReporterService,
  ) {}

  on(handler: SourceRunEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  start(): void {
    if (this.subscription) {
      return;
    }
    this.logService.debug("source-run-events:start");
    void this.recoverOutstandingRuns();
    this.subscription = this.apiService.subscribeToSourceRunEvents(
      (event) => {
        this.logService.debug("source-run-events:event", {
          type: event.type,
          runId: event.run.id,
        });
        void this.routeEvent(event);
        for (const handler of this.handlers) {
          const [handlerErr] = tryRun(() => handler(event));
          if (handlerErr) {
            this.logService.error("source-run-events:handler-error", {
              error: handlerErr,
            });
          }
        }
      },
      (error) => {
        this.logService.error("source-run-events:error", { error });
      },
    );
  }

  private async recoverOutstandingRuns(): Promise<void> {
    const [err, response] = await tryRun(this.apiService.sourceRuns());
    if (err) {
      this.logService.error("source-run-events:recovery-error", { error: err });
      return;
    }

    const runningRuns =
      response.data?.sourceRuns?.filter(
        (run) => run.status === SourceRunStatus.Running,
      ) ?? [];

    for (const run of runningRuns) {
      await this.handleSourceRunCreated({
        type: SourceRunEventType.SourceRunCreated,
        occurredAt: new Date().toISOString(),
        run,
      });
    }
  }

  private async routeEvent(event: SourceRunEvent): Promise<void> {
    switch (event.type) {
      case SourceRunEventType.SourceRunCreated:
        await this.handleSourceRunCreated(event);
        return;
      default:
        this.logService.debug("source-run-events:ignored", {
          type: event.type,
          runId: event.run.id,
        });
    }
  }

  private async handleSourceRunCreated(event: SourceRunEvent): Promise<void> {
    const runId = event.run.id;
    const summary = sourceRunActivitySummary(event.run);

    this.activityReporter?.report(
      ExtensionActivityEventType.SourceRunReceived,
      summary,
      { correlationId: runId, occurredAt: event.occurredAt },
    );

    const claim = await this.apiService.claimSourceRun(runId);
    if (!claim.data?.claimSourceRun) {
      this.logService.debug("source-run-events:claim-skipped", { runId });
      this.activityReporter?.report(
        ExtensionActivityEventType.SourceRunClaimSkipped,
        summary,
        { correlationId: runId },
      );
      return;
    }

    await this.apiService.updateSourceRunStatus(
      runId,
      SourceRunStatus.InProgress,
    );
    this.activityReporter?.report(
      ExtensionActivityEventType.SourceRunStarted,
      summary,
      { correlationId: runId },
    );

    const plan = planForSourceRun({
      sourceProfileId: event.run.sourceProfileId,
    });

    const surfaceUrl = surfaceUrlFromPlan(plan);
    if (surfaceUrl) {
      const [surfErr] = await tryRun(
        this.apiService.updateSourceRunSurfaceUrl(runId, surfaceUrl),
      );
      if (surfErr) {
        this.logService.error("source-run-events:surface-url-failed", {
          runId,
          error: surfErr,
        });
      }
    }

    const [runErr] = await tryRun(
      (async () => {
        await this.planService.execute(plan, {
          onJobCollected: async (job) => {
            const input = {
              ...mapCollectedJobToCreateJobInput(job),
              sourceRunId: runId,
            };
            const [createErr] = await tryRun(this.apiService.createJob(input));
            if (createErr) {
              this.logService.error("source-run-events:create-job-failed", {
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
                : summary,
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
      await this.apiService.updateSourceRunStatus(
        runId,
        SourceRunStatus.Failed,
      );
      this.logService.error("source-run-events:execution-failed", {
        runId,
        error: runErr,
      });
      this.activityReporter?.report(
        ExtensionActivityEventType.SourceRunFailed,
        summary,
        { correlationId: runId },
      );
      return;
    }

    this.activityReporter?.report(
      ExtensionActivityEventType.SourceRunCompleted,
      summary,
      { correlationId: runId },
    );
  }

  stop(): void {
    if (!this.subscription) {
      return;
    }
    this.logService.debug("source-run-events:stop");
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}
