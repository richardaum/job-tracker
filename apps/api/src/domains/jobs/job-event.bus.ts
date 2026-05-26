import {
  type DomainEvent,
  EventBus,
  type ScopedEventBus,
} from "@api/lib/domain-event";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JobEventBus extends EventBus<{ readonly jobId: string }> {
  forJob(
    userId: string,
    jobId: string,
  ): ScopedEventBus<{ readonly jobId: string }> {
    const bus = this.forUser(userId);
    return {
      eventsOf: <
        T extends DomainEvent & { readonly jobId: string },
      >(EventClass: {
        new (...args: never[]): T;
        readonly eventName: string;
      }): AsyncIterable<T> => ({
        [Symbol.asyncIterator]: async function* () {
          for await (const event of bus.eventsOf(EventClass)) {
            if (event.jobId === jobId) yield event;
          }
        },
      }),
    };
  }
}
