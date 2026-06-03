import { type DomainEvent, EventBus, type ScopedEventBus } from "@api/lib/domain-event";
import { Injectable } from "@nestjs/common";
import { AiMessageCompleted, AiMessageError, AiMessageTokenReceived } from "./ai-chat.events";
import { AiMessageStreamEventType } from "./ai-chat-event.types";

@Injectable()
export class AiChatEventBus extends EventBus<{ readonly conversationId: string }> {
  forConversation(userId: string, conversationId: string): ScopedEventBus<{ readonly conversationId: string }> {
    const bus = this.forUser(userId);
    return {
      eventsOf: <T extends DomainEvent & { readonly conversationId: string }>(EventClass: {
        new (...args: never[]): T;
        readonly eventName: string;
      }): AsyncIterable<T> => ({
        [Symbol.asyncIterator]: async function* () {
          for await (const event of bus.eventsOf(EventClass)) {
            if (event.conversationId === conversationId) yield event;
          }
        },
      }),
    };
  }

  async *createMessageStream(userId: string, conversationId: string): AsyncIterable<AiMessageStreamEventType> {
    const bus = this.forConversation(userId, conversationId);

    const tokenIter = bus.eventsOf(AiMessageTokenReceived)[Symbol.asyncIterator]();
    const completedIter = bus.eventsOf(AiMessageCompleted)[Symbol.asyncIterator]();
    const errorIter = bus.eventsOf(AiMessageError)[Symbol.asyncIterator]();

    const completedRace = completedIter.next().then((r) => ({ kind: "completed" as const, r }));
    const errorRace = errorIter.next().then((r) => ({ kind: "error" as const, r }));

    while (true) {
      const result = await Promise.race([
        tokenIter.next().then((r) => ({ kind: "token" as const, r })),
        completedRace,
        errorRace,
      ]);

      if (result.kind === "completed") {
        yield {
          conversationId,
          completed: true,
          userMessageId: result.r.value.userMessageId || null,
          aiMessageId: result.r.value.aiMessageId || null,
        };
        return;
      }

      if (result.kind === "error") {
        yield { conversationId, completed: true, error: result.r.value.error };
        return;
      }

      if (result.r.done) break;

      yield { conversationId, token: result.r.value.token, completed: false };
    }
  }
}
