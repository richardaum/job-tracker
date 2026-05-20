import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { DomainEvent } from "@api/lib/domain-event";

export class MatchStatusChanged extends DomainEvent {
  static readonly eventName = "match.status.changed";

  constructor(
    readonly matchId: string,
    readonly userId: string,
    readonly status: AsyncMetadataStatusEnum,
  ) {
    super();
  }
}

export class MatchAnalysisRequested extends DomainEvent {
  static readonly eventName = "match.analysis.requested";

  constructor(
    readonly matchId: string,
    readonly userId: string,
    readonly source: { jobId?: string; draftJobId?: string },
  ) {
    super();
  }
}
