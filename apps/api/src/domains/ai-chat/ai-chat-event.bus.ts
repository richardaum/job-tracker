import { type DomainEvent, EventBus, type ScopedEventBus } from "@api/lib/domain-event";
import { Injectable } from "@nestjs/common";

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
}
