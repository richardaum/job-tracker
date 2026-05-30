import { z } from "zod";

import {
  PlanSchema,
  PlanStepActionSchema,
  PlanStepCollectJobsDetailsFieldSchema,
  PlanStepCollectJobsInputSchema,
  PlanStepCollectJobsSurfaceFieldSchema,
  PlanStepParseRegexInputSchema,
  PlanStepSchema,
} from "./schema";

export type Plan = z.infer<typeof PlanSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export type PlanStepAction = z.infer<typeof PlanStepActionSchema>;
export type PlanStepCollectJobsSurfaceField = z.infer<
  typeof PlanStepCollectJobsSurfaceFieldSchema
>;
export type PlanStepCollectJobsDetailsField = z.infer<
  typeof PlanStepCollectJobsDetailsFieldSchema
>;
export type CollectJobsStepInput = z.infer<
  typeof PlanStepCollectJobsInputSchema
>;
export type ParseRegexStepInput = z.infer<typeof PlanStepParseRegexInputSchema>;
export type CollectJobsAction = Extract<
  PlanStepAction,
  { kind: "collect.jobs" }
>;
export type ParseRegexAction = Extract<PlanStepAction, { kind: "parse.regex" }>;
export type DomSurfaceField = Exclude<
  PlanStepCollectJobsSurfaceField,
  { type: "regex" }
>;
export type RegexSurfaceField = Extract<
  PlanStepCollectJobsSurfaceField,
  { type: "regex" }
>;
