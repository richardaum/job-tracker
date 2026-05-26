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
