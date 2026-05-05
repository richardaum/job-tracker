import { z } from "zod";

import {
  PlanSchema,
  PlanStepActionSchema,
  PlanStepCollectJobsDetailsFieldSchema,
  PlanStepCollectJobsInputSchema,
  PlanStepCollectJobsSurfaceFieldSchema,
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
