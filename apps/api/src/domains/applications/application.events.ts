import { TaskStatus } from "@api/domains/shared/async-task-meta.type";
import { DomainEvent } from "@api/lib/domain-event";

export class ApplicationCreated extends DomainEvent {
  static readonly eventName = "application.created";

  constructor(
    readonly applicationId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class ApplicationUpdated extends DomainEvent {
  static readonly eventName = "application.updated";

  constructor(
    readonly applicationId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class SummaryStatusChanged extends DomainEvent {
  static readonly eventName = "summary.status.changed";

  constructor(
    readonly applicationId: string,
    readonly userId: string,
    readonly status: TaskStatus,
  ) {
    super();
  }
}

export class SummaryGenerationRequested extends DomainEvent {
  static readonly eventName = "summary.generation.requested";

  constructor(
    readonly applicationId: string,
    readonly userId: string,
  ) {
    super();
  }
}
