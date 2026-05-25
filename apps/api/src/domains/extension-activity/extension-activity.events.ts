import type { ExtensionActivityEvent } from "@api/domains/extension-activity/extension-activity-event.type";
import { DomainEvent } from "@api/lib/domain-event";

export class ExtensionActivityReported extends DomainEvent {
  static readonly eventName = "extension-activity.reported";

  constructor(
    readonly userId: string,
    readonly payload: ExtensionActivityEvent,
  ) {
    super();
  }
}
