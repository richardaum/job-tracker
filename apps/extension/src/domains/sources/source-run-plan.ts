import remoteyeahFixture from "@/domains/plan/fixtures/remoteyeah.plan.json";
import type { Plan } from "@/domains/plan/model/types";
import { parsePlan } from "@/domains/plan/parse/parser";

/** First `collect.jobs` listing URL when present — persisted via `SourceRun.surfaceUrl` on the API. */
export function surfaceUrlFromPlan(plan: Plan): string | null {
  for (const step of plan.steps) {
    const action = step.action;
    if (typeof action !== "object" || action === null) {
      continue;
    }
    if (!("kind" in action) || action.kind !== "collect.jobs") {
      continue;
    }
    const input = action.input as { surfaceUrl?: string };
    const url = input.surfaceUrl?.trim();
    if (url) {
      return url;
    }
  }
  return null;
}

/**
 * Build the executable collect-jobs plan for an API source run.
 * **`surfaceUrl`** is seeded from **`remoteyeah.plan.json`** then sent to **`updateSourceRun`**.
 *
 * `surfaceUrl` matches {@link CollectJobsService.execute}
 * (`openWindow(surfaceUrl, { focus: true })`; detail URLs use `openTab`).
 */
export function planForSourceRun(params: { importerId: string }): Plan {
  const id = params.importerId.trim().toLowerCase();
  if (id !== "remoteyeah") {
    throw new Error(`No executor plan for importer: ${params.importerId}`);
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
