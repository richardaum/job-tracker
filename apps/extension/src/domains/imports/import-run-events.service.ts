import type {
  ApiService,
  ImportRunEventHandler,
} from "@/domains/api/api.service";
import type { LogService } from "@/domains/log/log.service";

type SubscriptionHandle = { unsubscribe: () => void };

export class ImportRunEventsService {
  private subscription: SubscriptionHandle | null = null;
  private readonly handlers = new Set<ImportRunEventHandler>();

  constructor(
    private readonly apiService: ApiService,
    private readonly logService: LogService,
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

  stop(): void {
    if (!this.subscription) {
      return;
    }
    this.logService.debug("import-run-events:stop");
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}
