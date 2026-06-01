import { JobUpdated, SummaryGenerationRequested } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { SettingsService } from "@api/domains/settings/settings.service";
import { Injectable, Logger } from "@nestjs/common";

import { JobSummaryService } from "./job-summary.service";

@Injectable()
export class SummaryEventListener {
  private readonly logger = new Logger(SummaryEventListener.name);

  constructor(
    private readonly eventBus: JobEventBus,
    private readonly summaryService: JobSummaryService,
    private readonly settingsService: SettingsService,
    private readonly jobsRepository: JobsRepository,
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
  }

  private async handleJobUpdated(event: JobUpdated): Promise<void> {
    const settings = await this.settingsService.getSettings(event.userId);
    if (!settings.autoSummaryEnabled) {
      return;
    }

    const job = await this.jobsRepository.findOneByIdAndUserId(event.jobId, event.userId);
    if (job?.stage === ApplicationStageEnum.Duplicated) {
      return;
    }

    await this.summaryService.requestSummary(event.jobId, event.userId);
  }

  private async handleSummaryGenerationRequested(event: SummaryGenerationRequested): Promise<void> {
    await this.summaryService.doGenerate(event.jobId, event.userId);
  }
}
