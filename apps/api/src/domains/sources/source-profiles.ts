/**
 * Frozen executor documents for registry source profiles (must match extension collect-jobs shape where used).
 *
 * Fixture copy: keep in sync with
 * **`apps/extension/src/domains/plan/fixtures/remoteyeah.plan.json`**.
 */

import remoteyeahPlanFixture from "@api/domains/sources/fixtures/remoteyeah.plan.json";

export type ExecutorPlanDocument = Readonly<{
  id?: string;
  steps: readonly Readonly<Record<string, unknown>>[];
}>;

export const remoteyeahExecutorPlan: ExecutorPlanDocument = Object.freeze(
  remoteyeahPlanFixture as ExecutorPlanDocument,
);

/** Listing URL for `SourceRun`: first literal `tab.open`, or `collect.jobs` `input.surfaceUrl`. */
export function entryUrlFromExecutorPlan(
  plan: ExecutorPlanDocument,
): string | null {
  for (const step of plan.steps) {
    const action = step.action;
    const url = step.url;
    if (
      action === "tab.open" &&
      typeof url === "string" &&
      url.trim() !== "" &&
      !/{{/.test(url)
    ) {
      return url;
    }

    if (
      typeof action === "object" &&
      action !== null &&
      !Array.isArray(action)
    ) {
      const act = action as Record<string, unknown>;
      if (act.kind === "collect.jobs") {
        const input = act.input;
        if (
          typeof input === "object" &&
          input !== null &&
          !Array.isArray(input)
        ) {
          const surfaceUrl = (input as Record<string, unknown>).surfaceUrl;
          if (
            typeof surfaceUrl === "string" &&
            surfaceUrl.trim() !== "" &&
            !/{{/.test(surfaceUrl)
          ) {
            return surfaceUrl;
          }
        }
      }
    }
  }
  return null;
}
