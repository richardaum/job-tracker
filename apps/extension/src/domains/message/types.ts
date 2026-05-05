import { z } from "zod";

import {
  ContentActionMessageSchema,
  EventPayloadSchemas,
  LogEventPayloadSchema,
  MessageEnvelopeSchema,
  RequestPayloadSchemas,
  RuntimeKindSchema,
} from "./schema";

export type ContentActionMessage = z.infer<typeof ContentActionMessageSchema>;
export type ContentActionKind = ContentActionMessage["kind"];
export type RuntimeKind = z.infer<typeof RuntimeKindSchema>;
export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
export type LogEventPayload = z.infer<typeof LogEventPayloadSchema>;
export type RequestType = keyof typeof RequestPayloadSchemas;
export type EventType = keyof typeof EventPayloadSchemas;
export type RequestPayloadByType = {
  [K in RequestType]: z.infer<(typeof RequestPayloadSchemas)[K]>;
};
export type EventPayloadByType = {
  [K in EventType]: z.infer<(typeof EventPayloadSchemas)[K]>;
};
