import {
  DraftApplicationEventBus,
  type DraftConversionRequestedEvent,
} from "@api/domains/draft-applications/draft-application-event.bus";
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
    this.draftEventBus.onDraftConversionRequested((event) => {
      void this.handleDraftConversionRequested(event);
    });
    this.logger.log("Listening for draft.conversion.requested events");
  }

  private async handleDraftConversionRequested(
    event: DraftConversionRequestedEvent,
  ): Promise<void> {
    await this.applicationService.convertDraftInBackground(
      event.userId,
      event.draftId,
    );
  }
}
