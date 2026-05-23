import {
  JobUpdated,
  SummaryGenerationRequested,
} from "@api/domains/jobs/job.events";
import { JobAsyncMetadataRepository } from "@api/domains/jobs/job-async-metadata.repository";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { SummaryService } from "./summary.service";

@Injectable()
export class SummaryEventListener implements OnModuleInit {
  private readonly logger = new Logger(SummaryEventListener.name);

  constructor(
    private readonly eventBus: JobEventBus,
    private readonly summaryService: SummaryService,
    private readonly asyncMetadataRepo: JobAsyncMetadataRepository,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(JobUpdated, (event) => {
      this.handleJobUpdated(event).catch((err) =>
        this.logger.error(
          `SummaryEventListener error for ${event.jobId}`,
          err instanceof Error ? err.message : String(err),
        ),
      );
    });

    this.eventBus.on(SummaryGenerationRequested, (event) => {
      void this.handleSummaryGenerationRequested(event);
    });

    void this.resetStuckProcessing();
  }

  private async handleJobUpdated(event: JobUpdated): Promise<void> {
    await this.summaryService.generateSummary(event.jobId, event.userId);
  }

  private async handleSummaryGenerationRequested(
    event: SummaryGenerationRequested,
  ): Promise<void> {
    await this.summaryService.doGenerate(event.jobId, event.userId);
  }

  private async resetStuckProcessing(): Promise<void> {
    const count = await this.asyncMetadataRepo.resetStaleSummaryProcessing();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale PROCESSING summaries`);
    }
  }
}
