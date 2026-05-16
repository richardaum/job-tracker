import { FitAnalysisStatusEnum } from "@api/database/entities/fit-analysis.entity";
import { DomainEvent } from "@api/lib/domain-event";

export class FitStatusChanged extends DomainEvent {
  static readonly eventName = "fit.status.changed";

  constructor(
    readonly fitId: string,
    readonly userId: string,
    readonly status: FitAnalysisStatusEnum,
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
