import { DraftConversionRequested } from "@api/domains/draft-jobs/draft-job.events";
import { DraftJobEventBus } from "@api/domains/draft-jobs/draft-job-event.bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { JobsService } from "./jobs.service";

@Injectable()
export class DraftConversionEventListener implements OnModuleInit {
  private readonly logger = new Logger(DraftConversionEventListener.name);

  constructor(
    private readonly draftEventBus: DraftJobEventBus,
    private readonly jobsService: JobsService,
  ) {}

  onModuleInit(): void {
    this.draftEventBus.on(DraftConversionRequested, (event) => {
      void this.handleDraftConversionRequested(event);
    });
    this.logger.log("Listening for draft.conversion.requested events");
  }

  private async handleDraftConversionRequested(
    event: DraftConversionRequested,
  ): Promise<void> {
    await this.jobsService.processDraftConversion(event.userId, event.draftId);
  }
}
