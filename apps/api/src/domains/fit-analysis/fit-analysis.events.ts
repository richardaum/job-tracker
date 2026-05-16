import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { DomainEvent } from "@api/lib/domain-event";

export class FitStatusChanged extends DomainEvent {
  static readonly eventName = "fit.status.changed";

  constructor(
    readonly fitId: string,
    readonly userId: string,
    readonly status: AsyncMetadataStatusEnum,
  ) {
    super();
  }
}

export class FitAnalysisRequested extends DomainEvent {
  static readonly eventName = "fit.analysis.requested";

  constructor(
    readonly fitId: string,
    readonly userId: string,
    readonly source: { applicationId?: string; draftApplicationId?: string },
  ) {
    super();
  }
}
