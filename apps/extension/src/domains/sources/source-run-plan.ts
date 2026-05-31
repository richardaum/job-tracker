import remoteyeahFixture from "@/domains/plan/fixtures/remoteyeah.plan.json";
import telegramJsgurujobsFixture from "@/domains/plan/fixtures/telegram-jsgurujobs.plan.json";
import type { Plan } from "@/domains/plan/model/types";
import { parsePlan } from "@/domains/plan/parse/parser";

const FIXTURES: Record<string, Record<string, unknown>> = {
  "2e84cb8d-d9f2-4a02-947e-80909eb76709": structuredClone(remoteyeahFixture),
  "d8f32c52-051c-4d96-be74-5a661e89f683": structuredClone(
    telegramJsgurujobsFixture,
  ),
};

/** Build the executable collect-jobs plan for an API source run. */
export function planForSourceRun(planId: string): Plan {
  const raw = FIXTURES[planId];
  if (!raw) {
    throw new Error(`No executor plan for plan ID: ${planId}`);
  }

  const steps = raw.steps as Array<Record<string, unknown>>;
  const step0 = steps[0] as Record<string, unknown>;
  const action = step0.action as Record<string, unknown>;

  if (action.kind !== "collect.jobs") {
    throw new Error(`Invalid plan fixture for ${planId}`);
  }

  return parsePlan(raw);
}
