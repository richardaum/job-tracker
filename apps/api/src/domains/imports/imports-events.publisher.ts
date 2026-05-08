import { ImportRunEvent } from "@api/domains/imports/import-run-event.type";

export type ImportRunDomainEvent = { userId: string; payload: ImportRunEvent };

export interface ImportsEventsPublisher {
  publish(event: ImportRunDomainEvent): Promise<void>;
  subscribe(): AsyncIterable<ImportRunDomainEvent>;
}

export const IMPORTS_EVENTS_PUBLISHER = Symbol("IMPORTS_EVENTS_PUBLISHER");
