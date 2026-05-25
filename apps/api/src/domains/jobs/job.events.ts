import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { DomainEvent } from "@api/lib/domain-event";

export class JobCreated extends DomainEvent {
  static readonly eventName = "job.created";

  constructor(
    readonly jobId: string,
    readonly userId: string,
    readonly autoMatch?: boolean | null,
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

export class FillJobRequested extends DomainEvent {
  static readonly eventName = "job.fill.requested";

  constructor(
    readonly jobId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class FillJobCompleted extends DomainEvent {
  static readonly eventName = "job.fill.completed";

  constructor(
    readonly jobId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class FillJobFailed extends DomainEvent {
  static readonly eventName = "job.fill.failed";

  constructor(
    readonly jobId: string,
    readonly userId: string,
    readonly error: string,
  ) {
    super();
  }
}

export class JobMatchStatusChanged extends DomainEvent {
  static readonly eventName = "job.match.status.changed";

  constructor(
    readonly jobId: string,
    readonly userId: string,
    readonly matchId: string,
    readonly status: AsyncMetadataStatusEnum,
  ) {
    super();
  }
}
