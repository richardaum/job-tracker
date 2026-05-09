import { tryRun } from "@job-tracker/try-run";

import type {
  ApiService,
  ImportRunEventHandler,
} from "@/domains/api/api.service";
import {
  planForImportRun,
  surfaceUrlFromPlan,
} from "@/domains/imports/import-run-plan";
import type { LogService } from "@/domains/log/log.service";
import { mapCollectedJobToCreateApplicationInput } from "@/domains/plan/map-collected-job-to-create-application-input";
import type { PlanService } from "@/domains/plan/services/plan.service";
import {
  type ImportRunEventsSubscription,
  ImportRunEventType,
  ImportRunStatus,
} from "@/gql/graphql";

type SubscriptionHandle = { unsubscribe: () => void };
type ImportRunEvent = ImportRunEventsSubscription["importRunEvents"];

export class ImportRunEventsService {
  private subscription: SubscriptionHandle | null = null;
  private readonly handlers = new Set<ImportRunEventHandler>();

  constructor(
    private readonly apiService: ApiService,
    private readonly logService: LogService,
    private readonly planService: PlanService,
  ) {}

  on(handler: ImportRunEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  start(): void {
    if (this.subscription) {
      return;
    }
    this.logService.debug("import-run-events:start");
    void this.recoverOutstandingRuns();
    this.subscription = this.apiService.subscribeToImportRunEvents(
      (event) => {
        this.logService.debug("import-run-events:event", {
          type: event.type,
          runId: event.run.id,
        });
        void this.routeEvent(event);
        for (const handler of this.handlers) {
          const [handlerErr] = tryRun(() => handler(event));
          if (handlerErr) {
            this.logService.debug("import-run-events:handler-error", {
              error: handlerErr,
            });
          }
        }
      },
      (error) => {
        this.logService.debug("import-run-events:error", { error });
      },
    );
  }

  private async recoverOutstandingRuns(): Promise<void> {
    const [err, response] = await tryRun(this.apiService.importRuns());
    if (err) {
      this.logService.debug("import-run-events:recovery-error", { error: err });
      return;
    }

    const runningRuns =
      response.data?.importRuns?.filter(
        (run) => run.status === ImportRunStatus.Running,
      ) ?? [];

    for (const run of runningRuns) {
      await this.handleImportRunCreated({
        type: ImportRunEventType.ImportRunCreated,
        occurredAt: new Date().toISOString(),
        run,
      });
    }
  }

  private async routeEvent(event: ImportRunEvent): Promise<void> {
    switch (event.type) {
      case ImportRunEventType.ImportRunCreated:
        await this.handleImportRunCreated(event);
        return;
      default:
        this.logService.debug("import-run-events:ignored", {
          type: event.type,
          runId: event.run.id,
        });
    }
  }

  private async handleImportRunCreated(event: ImportRunEvent): Promise<void> {
    const runId = event.run.id;
    const claim = await this.apiService.claimImportRun(runId);
    if (!claim.data?.claimImportRun) {
      this.logService.debug("import-run-events:claim-skipped", { runId });
      return;
    }

    await this.apiService.updateImportRunStatus(
      runId,
      ImportRunStatus.InProgress,
    );

    const plan = planForImportRun({ importerId: event.run.importerId });

    const surfaceUrl = surfaceUrlFromPlan(plan);
    if (surfaceUrl) {
      const [surfErr] = await tryRun(
        this.apiService.updateImportRunSurfaceUrl(runId, surfaceUrl),
      );
      if (surfErr) {
        this.logService.debug("import-run-events:surface-url-failed", {
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
              ...mapCollectedJobToCreateApplicationInput(job),
              importRunId: runId,
            };
            const [createErr] = await tryRun(
              this.apiService.createApplication(input),
            );
            if (createErr) {
              this.logService.debug(
                "import-run-events:create-application-failed",
                { runId, error: createErr, title: job.title },
              );
            }
          },
        });
        await this.apiService.updateImportRunStatus(
          runId,
          ImportRunStatus.Completed,
        );
      })(),
    );

    if (runErr) {
      await this.apiService.updateImportRunStatus(
        runId,
        ImportRunStatus.Failed,
      );
      this.logService.debug("import-run-events:execution-failed", {
        runId,
        error: runErr,
      });
    }
  }

  stop(): void {
    if (!this.subscription) {
      return;
    }
    this.logService.debug("import-run-events:stop");
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}
