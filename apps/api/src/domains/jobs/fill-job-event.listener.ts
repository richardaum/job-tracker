import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { FillJobRequested } from "./job.events";
import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { JobEventBus } from "./job-event.bus";
import { JobsService } from "./jobs.service";

@Injectable()
export class FillJobEventListener implements OnModuleInit {
  private readonly logger = new Logger(FillJobEventListener.name);

  constructor(
    private readonly eventBus: JobEventBus,
    private readonly asyncMetadataRepo: JobAsyncMetadataRepository,
    private readonly jobsService: JobsService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(FillJobRequested, (event) => {
      void this.jobsService
        .processFillJob(event.userId, event.jobId)
        .catch((err) =>
          this.logger.error(
            `processFillJob failed for job ${event.jobId}`,
            err instanceof Error ? err.stack : String(err),
          ),
        );
    });

    void this.resetStaleProcessing();
    this.logger.log("Listening for job.fill.requested events");
  }

  private async resetStaleProcessing(): Promise<void> {
    const count = await this.asyncMetadataRepo.resetStaleFillProcessing();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale PROCESSING fill jobs`);
    }
  }
}
