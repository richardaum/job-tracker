import { DomainEvent } from "@api/lib/domain-event";

export class AiMessageTokenReceived extends DomainEvent {
  static readonly eventName = "ai.message.token.received";

  constructor(
    readonly conversationId: string,
    readonly userId: string,
    readonly token: string,
    readonly messageId?: string,
  ) {
    super();
  }
}

export class AiMessageCompleted extends DomainEvent {
  static readonly eventName = "ai.message.completed";

  constructor(
    readonly conversationId: string,
    readonly userId: string,
    readonly userMessageId: string,
    readonly aiMessageId: string,
  ) {
    super();
  }
}
