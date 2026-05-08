import type {
  ApiService,
  ImportRunEventHandler,
} from "@/domains/api/api.service";
import type { ImportApplicationService } from "@/domains/import-application/import-application.service";
import type { LogService } from "@/domains/log/log.service";
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
    private readonly importApplicationService: ImportApplicationService,
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
    try {
      await this.importApplicationService.execute();
      await this.apiService.updateImportRunStatus(
        runId,
        ImportRunStatus.Completed,
      );
    } catch (error) {
      await this.apiService.updateImportRunStatus(
        runId,
        ImportRunStatus.Failed,
      );
      this.logService.debug("import-run-events:execution-failed", {
        runId,
        error,
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
