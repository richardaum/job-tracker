import { DomainEvent } from "@api/lib/domain-event";

export class AiUsageChanged extends DomainEvent {
  static readonly eventName = "settings.ai-usage.changed";

  constructor(
    readonly userId: string,
    readonly trialCallsUsed: number,
    readonly hasOpenAiKey: boolean,
  ) {
    super();
  }
}
