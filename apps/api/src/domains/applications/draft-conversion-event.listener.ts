import { DraftConversionRequested } from "@api/domains/draft-applications/draft-application.events";
import { DraftApplicationEventBus } from "@api/domains/draft-applications/draft-application-event.bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { ApplicationService } from "./applications.service";

@Injectable()
export class DraftConversionEventListener implements OnModuleInit {
  private readonly logger = new Logger(DraftConversionEventListener.name);

  constructor(
    private readonly draftEventBus: DraftApplicationEventBus,
    private readonly applicationService: ApplicationService,
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
    await this.applicationService.processDraftConversion(
      event.userId,
      event.draftId,
    );
  }
}
