import {
  ApplicationUpdated,
  SummaryGenerationRequested,
} from "@api/domains/applications/application.events";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { SummaryService } from "./summary.service";

@Injectable()
export class SummaryEventListener implements OnModuleInit {
  private readonly logger = new Logger(SummaryEventListener.name);

  constructor(
    private readonly eventBus: ApplicationEventBus,
    private readonly summaryService: SummaryService,
    private readonly appRepo: ApplicationRepository,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(ApplicationUpdated, (event) => {
      this.handleApplicationUpdated(event).catch((err) =>
        this.logger.error(
          `SummaryEventListener error for ${event.applicationId}`,
          err instanceof Error ? err.message : String(err),
        ),
      );
    });

    this.eventBus.on(SummaryGenerationRequested, (event) => {
      void this.handleSummaryGenerationRequested(event);
    });

    void this.resetStuckProcessing();
  }

  private async handleApplicationUpdated(
    event: ApplicationUpdated,
  ): Promise<void> {
    await this.summaryService.generateSummary(
      event.applicationId,
      event.userId,
    );
  }

  private async handleSummaryGenerationRequested(
    event: SummaryGenerationRequested,
  ): Promise<void> {
    await this.summaryService.doGenerate(event.applicationId, event.userId);
  }

  private async resetStuckProcessing(): Promise<void> {
    const count = await this.appRepo.resetStaleSummaryProcessing();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale PROCESSING summaries`);
    }
  }
}
