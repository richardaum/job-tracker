import { z } from "zod";

import { CollectJobsPlanStepActionSchema } from "@/domains/plan/model/schema";

export const RuntimeKindSchema = z.enum(["popup", "background", "content"]);
export const MessageModeSchema = z.enum(["request", "response", "event"]);

export const JobsListMessageSchema = z.object({
  kind: z.literal("jobs.list"),
  action: CollectJobsPlanStepActionSchema,
});

export const JobDetailsMessageSchema = z.object({
  kind: z.literal("job.details"),
  action: CollectJobsPlanStepActionSchema,
});

export const NavigateNextPageMessageSchema = z.object({
  kind: z.literal("navigate.next.page"),
  action: CollectJobsPlanStepActionSchema,
});

export const CanNavigateNextPageMessageSchema = z.object({
  kind: z.literal("can.navigate.next.page"),
  action: CollectJobsPlanStepActionSchema,
});

export const ImportJobMessageSchema = z.object({ kind: z.literal("import.job") });

export const ImportJobMenuLabelMessageSchema = z.object({ kind: z.literal("import.job.menu-label") });

export const ContentActionMessageSchema = z.discriminatedUnion("kind", [
  JobsListMessageSchema,
  JobDetailsMessageSchema,
  NavigateNextPageMessageSchema,
  CanNavigateNextPageMessageSchema,
  ImportJobMessageSchema,
  ImportJobMenuLabelMessageSchema,
]);

export const LogLevelSchema = z.enum(["debug", "info", "warn", "error"]);

export const LogEventPayloadSchema = z.object({
  level: LogLevelSchema,
  message: z.string(),
  data: z.array(z.unknown()).optional(),
  timestamp: z.iso.datetime(),
});

export const RequestPayloadSchemas = {
  "jobs.list": JobsListMessageSchema,
  "job.details": JobDetailsMessageSchema,
  "navigate.next.page": NavigateNextPageMessageSchema,
  "can.navigate.next.page": CanNavigateNextPageMessageSchema,
  "import.job": ImportJobMessageSchema,
  "import.job.menu-label": ImportJobMenuLabelMessageSchema,
} as const;

export const EventPayloadSchemas = { "log.event": LogEventPayloadSchema } as const;

export const MessageEnvelopeSchema = z.object({
  id: z.string().min(1),
  mode: MessageModeSchema,
  kind: z.string().min(1),
  from: RuntimeKindSchema,
  to: RuntimeKindSchema,
  correlationId: z.string().min(1).optional(),
  tabId: z.number().int().positive().optional(),
  payload: z.unknown(),
  timestamp: z.iso.datetime(),
});
