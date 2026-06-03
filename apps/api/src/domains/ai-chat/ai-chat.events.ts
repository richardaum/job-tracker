import { DomainEvent } from "@api/lib/domain-event";

export class AiChatRequested extends DomainEvent {
  static readonly eventName = "ai.chat.requested";

  constructor(
    readonly conversationId: string,
    readonly userId: string,
    readonly jobId: string,
    readonly content: string,
    readonly userMessageId: string,
  ) {
    super();
  }
}

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

export class AiMessageError extends DomainEvent {
  static readonly eventName = "ai.message.error";

  constructor(
    readonly conversationId: string,
    readonly userId: string,
    readonly error: string,
  ) {
    super();
  }
}
