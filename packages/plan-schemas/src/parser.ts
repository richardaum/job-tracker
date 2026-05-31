import { PlanSchema } from "./schema";
import type { Plan } from "./types";

export function parseSerializedPlan(rawPlanJson: string): Plan {
  if (!rawPlanJson.trim()) throw new Error("Invalid plan");

  const planUnknown = JSON.parse(rawPlanJson) as unknown;
  return parsePlan(planUnknown);
}

export function parsePlan(planUnknown: unknown): Plan {
  return PlanSchema.parse(planUnknown);
}
