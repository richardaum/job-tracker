import remoteyeahFixture from "@/domains/plan/fixtures/remoteyeah.plan.json";
import type { Plan } from "@/domains/plan/model/types";
import { parsePlan } from "@/domains/plan/parse/parser";

/** Build the executable collect-jobs plan for an API source run. */
export function planForSourceRun(params: { sourceProfileId: string }): Plan {
  const id = params.sourceProfileId.trim().toLowerCase();
  if (id !== "remoteyeah") {
    throw new Error(
      `No executor plan for source profile: ${params.sourceProfileId}`,
    );
  }

  const raw = structuredClone(remoteyeahFixture) as Record<string, unknown>;
  const steps = raw.steps as Array<Record<string, unknown>>;
  const step0 = steps[0] as Record<string, unknown>;
  const action = step0.action as Record<string, unknown>;

  if (action.kind !== "collect.jobs") {
    throw new Error("Invalid remoteyeah plan fixture");
  }

  return parsePlan(raw);
}
