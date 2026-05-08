import { to } from "@job-tracker/async";

import type {
  ApiService,
  ImportRunEventHandler,
} from "@/domains/api/api.service";
import { planForImportRun } from "@/domains/imports/import-run-plan";
import type { LogService } from "@/domains/log/log.service";
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
          try {
            handler(event);
          } catch (error) {
            this.logService.debug("import-run-events:handler-error", { error });
          }
        }
      },
      (error) => {
        this.logService.debug("import-run-events:error", { error });
      },
    );
  }

  private async recoverOutstandingRuns(): Promise<void> {
    const [err, response] = await to(this.apiService.importRuns());
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

    const plan = planForImportRun({
      importerId: event.run.importerId,
      entryUrl: event.run.entryUrl,
    });

    const [runErr] = await to(
      (async () => {
        await this.planService.execute(plan);
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
