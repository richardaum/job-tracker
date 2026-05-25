import { Injectable, Logger } from "@nestjs/common";

import { FillJobRequested } from "./job.events";
import { JobAutomaticFillService } from "./job-automatic-fill.service";
import { JobEventBus } from "./job-event.bus";

@Injectable()
export class FillJobEventListener {
  private readonly logger = new Logger(FillJobEventListener.name);

  constructor(
    private readonly eventBus: JobEventBus,
    private readonly fillService: JobAutomaticFillService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(FillJobRequested, (event) => {
      void this.fillService
        .processFillJob(event.userId, event.jobId)
        .catch((err) =>
          this.logger.error(
            `processFillJob failed for job ${event.jobId}`,
            err instanceof Error ? err.stack : String(err),
          ),
        );
    });

    this.logger.log("Listening for job.fill.requested events");
  }
}
