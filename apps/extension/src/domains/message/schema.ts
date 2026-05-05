import { z } from "zod";

import { PlanStepActionSchema } from "@/domains/plan/model/schema";

/**
 * Content-script requests carry `action: PlanStepAction`. For `collect.jobs`,
 * concurrent detail-tab work is capped by `action.input.parallelDetailsTabs`
 * (see plan schema); background applies that limit when opening detail tabs.
 */
export const RuntimeKindSchema = z.enum(["popup", "background", "content"]);
export const MessageModeSchema = z.enum(["request", "response", "event"]);

export const JobsListMessageSchema = z.object({
  kind: z.literal("jobs.list"),
  action: PlanStepActionSchema,
});

export const JobDetailsMessageSchema = z.object({
  kind: z.literal("job.details"),
  action: PlanStepActionSchema,
});

export const NavigateNextPageMessageSchema = z.object({
  kind: z.literal("navigate.next.page"),
  action: PlanStepActionSchema,
});

export const CanNavigateNextPageMessageSchema = z.object({
  kind: z.literal("can.navigate.next.page"),
  action: PlanStepActionSchema,
});

export const ContentActionMessageSchema = z.discriminatedUnion("kind", [
  JobsListMessageSchema,
  JobDetailsMessageSchema,
  NavigateNextPageMessageSchema,
  CanNavigateNextPageMessageSchema,
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
} as const;

export const EventPayloadSchemas = {
  "log.event": LogEventPayloadSchema,
} as const;

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
