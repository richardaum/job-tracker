import { DomainEvent } from "@api/lib/domain-event";

import type { SourceRunEvent } from "./source-run-event.type";

export class SourceRunReported extends DomainEvent {
  static readonly eventName = "source-run.reported";

  constructor(
    readonly userId: string,
    readonly payload: SourceRunEvent,
  ) {
    super();
  }
}
