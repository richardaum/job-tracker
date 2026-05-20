import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { DomainEvent } from "@api/lib/domain-event";

export class JobCreated extends DomainEvent {
  static readonly eventName = "job.created";

  constructor(
    readonly jobId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class JobUpdated extends DomainEvent {
  static readonly eventName = "job.updated";

  constructor(
    readonly jobId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class SummaryStatusChanged extends DomainEvent {
  static readonly eventName = "summary.status.changed";

  constructor(
    readonly jobId: string,
    readonly userId: string,
    readonly status: AsyncMetadataStatusEnum,
  ) {
    super();
  }
}

export class SummaryGenerationRequested extends DomainEvent {
  static readonly eventName = "summary.generation.requested";

  constructor(
    readonly jobId: string,
    readonly userId: string,
  ) {
    super();
  }
}
