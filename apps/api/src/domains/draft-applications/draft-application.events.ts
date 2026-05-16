import { DraftApplicationConversionStatusEnum } from "@api/database/entities/draft-application.entity";
import { DomainEvent } from "@api/lib/domain-event";

export class DraftConversionStatusChanged extends DomainEvent {
  static readonly eventName = "draft.conversion.status.changed";

  constructor(
    readonly draftId: string,
    readonly userId: string,
    readonly status: DraftApplicationConversionStatusEnum,
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
