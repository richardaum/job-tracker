import { ApplicationEntity } from "@api/database/entities/application.entity";
import {
  ApplicationEventBus,
  ApplicationUpdatedEvent,
  type SummaryGenerationRequestedEvent,
} from "@api/domains/applications/application-event.bus";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SummaryService } from "./summary.service";
import { ApplicationSummaryStatus } from "./summary-status.enum";

@Injectable()
export class SummaryEventListener implements OnModuleInit {
  private readonly logger = new Logger(SummaryEventListener.name);

  constructor(
    private readonly eventBus: ApplicationEventBus,
    private readonly summaryService: SummaryService,
    @InjectRepository(ApplicationEntity)
    private readonly appRepo: Repository<ApplicationEntity>,
  ) {}

  onModuleInit(): void {
    this.eventBus.onApplicationUpdated((event) => {
      this.handleApplicationUpdated(event).catch((err) =>
        this.logger.error(
          `SummaryEventListener error for ${event.applicationId}`,
          err instanceof Error ? err.message : String(err),
        ),
      );
    });

    this.eventBus.onSummaryGenerationRequested((event) => {
      void this.handleSummaryGenerationRequested(event);
    });

    void this.resetStuckProcessing();
  }

  private async handleApplicationUpdated(
    event: ApplicationUpdatedEvent,
  ): Promise<void> {
    await this.summaryService.generateSummary(
      event.applicationId,
      event.userId,
    );
  }

  private async handleSummaryGenerationRequested(
    event: SummaryGenerationRequestedEvent,
  ): Promise<void> {
    const { applicationId, userId } = event;
    const [error] = await tryRun(
      this.summaryService.doGenerate(applicationId, userId),
    );
    if (error) {
      this.logger.error(
        `Failed to generate summary for ${applicationId}`,
        error instanceof Error ? error.message : String(error),
      );
      await this.appRepo.update(
        { id: applicationId, userId },
        {
          summaryStatus: ApplicationSummaryStatus.FAILED,
          summaryError:
            error instanceof Error ? error.message : "Unknown error",
        },
      );
      this.eventBus.emitSummaryStatusChanged(
        applicationId,
        userId,
        ApplicationSummaryStatus.FAILED,
      );
      return;
    }

    this.eventBus.emitSummaryStatusChanged(
      applicationId,
      userId,
      ApplicationSummaryStatus.COMPLETED,
    );
  }

  private async resetStuckProcessing(): Promise<void> {
    const [err] = await tryRun(
      this.appRepo
        .createQueryBuilder()
        .update()
        .set({
          summaryStatus: ApplicationSummaryStatus.FAILED,
          summaryError: "Server restart",
        })
        .where("summary_status = :processing", {
          processing: ApplicationSummaryStatus.PROCESSING,
        })
        .execute(),
    );
    if (err) {
      this.logger.warn("Failed to reset stuck PROCESSING summaries");
    }
  }
}
