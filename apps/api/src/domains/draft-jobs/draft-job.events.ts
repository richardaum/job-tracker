import { DraftJobConversionStatusEnum } from "@api/database/entities/draft-job-conversion.enum";
import { DomainEvent } from "@api/lib/domain-event";

export class DraftConversionStatusChanged extends DomainEvent {
  static readonly eventName = "draft.conversion.status.changed";

  constructor(
    readonly draftId: string,
    readonly userId: string,
    readonly status: DraftJobConversionStatusEnum,
  ) {
    super();
  }
}

export class DraftConversionRequested extends DomainEvent {
  static readonly eventName = "draft.conversion.requested";

  constructor(
    readonly draftId: string,
    readonly userId: string,
  ) {
    super();
  }
}
