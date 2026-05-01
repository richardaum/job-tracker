import { describe, expect, it } from "vitest";

import { RequestMetricsContext } from "./request-metrics.context";

describe("RequestMetricsContext", () => {
  it("tracks query count inside scoped context", () => {
    const context = new RequestMetricsContext();
    const queryCount = context.runWithContext(() => {
      context.incrementQueryCount();
      context.incrementQueryCount();
      return context.getQueryCount();
    });

    expect(queryCount).toBe(2);
  });

  it("does not leak query count outside scope", () => {
    const context = new RequestMetricsContext();
    context.runWithContext(() => {
      context.incrementQueryCount();
    });

    expect(context.getQueryCount()).toBe(0);
  });
});
