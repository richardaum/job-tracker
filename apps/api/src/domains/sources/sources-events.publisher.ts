import { SourceRunEvent } from "@api/domains/sources/source-run-event.type";

export type SourceRunDomainEvent = { userId: string; payload: SourceRunEvent };

export interface SourcesEventsPublisher {
  publish(event: SourceRunDomainEvent): Promise<void>;
  subscribe(): AsyncIterable<SourceRunDomainEvent>;
}

export const SOURCES_EVENTS_PUBLISHER = Symbol("SOURCES_EVENTS_PUBLISHER");
