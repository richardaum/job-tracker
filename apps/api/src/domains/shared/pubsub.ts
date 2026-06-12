import { PubSub as GraphqlPubSub, type PubSubOptions } from "graphql-subscriptions";

export type { PubSubOptions };

export type PubSubEventMap = { [event: string]: unknown };

/**
 * Thin wrapper around graphql-subscriptions PubSub with corrected async iterator
 * typing. The upstream PubSubAsyncIterableIterator declares throw() as
 * Promise<never>, which breaks for-await without a cast.
 */
export class PubSub<Events extends PubSubEventMap = Record<string, never>> {
  private readonly pubSub: GraphqlPubSub<Events>;

  constructor(options?: PubSubOptions) {
    this.pubSub = new GraphqlPubSub<Events>(options);
  }

  publish<K extends keyof Events>(
    triggerName: K & string,
    payload: Events[K] extends never ? never : Events[K],
  ): Promise<void> {
    return this.pubSub.publish(triggerName, payload);
  }

  asyncIterableIterator<K extends keyof Events & string>(trigger: K): AsyncIterable<Events[K]> {
    return this.pubSub.asyncIterableIterator(trigger) as AsyncIterable<Events[K]>;
  }
}
