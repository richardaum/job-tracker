import { describe, expect, it } from "vitest";

import { PlanSchema } from "./schema";

describe("PlanSchema", () => {
  it("parses a valid plan with boardType Sequential", () => {
    const result = PlanSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      boardType: "Sequential",
      steps: [
        {
          id: "step-1",
          action: {
            kind: "collect.jobs",
            input: {
              containerSelector: ".list",
              itemSelector: ".card",
              detailsUrlField: "detailUrl",
              surfaceFields: [],
              detailsFields: [],
            },
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.boardType).toBe("Sequential");
    }
  });

  it("parses a valid plan with boardType NonSequential", () => {
    const result = PlanSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      boardType: "NonSequential",
      steps: [
        {
          id: "step-1",
          action: {
            kind: "collect.jobs",
            input: {
              containerSelector: ".list",
              itemSelector: ".card",
              detailsUrlField: "detailUrl",
              surfaceFields: [],
              detailsFields: [],
            },
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.boardType).toBe("NonSequential");
    }
  });

  it("rejects a plan without boardType", () => {
    const result = PlanSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      steps: [
        {
          id: "step-1",
          action: {
            kind: "collect.jobs",
            input: {
              containerSelector: ".list",
              itemSelector: ".card",
              detailsUrlField: "detailUrl",
              surfaceFields: [],
              detailsFields: [],
            },
          },
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a plan with unknown boardType", () => {
    const result = PlanSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      boardType: "Unknown",
      steps: [
        {
          id: "step-1",
          action: {
            kind: "collect.jobs",
            input: {
              containerSelector: ".list",
              itemSelector: ".card",
              detailsUrlField: "detailUrl",
              surfaceFields: [],
              detailsFields: [],
            },
          },
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a plan with boardType as wrong type (number)", () => {
    const result = PlanSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      boardType: 123,
      steps: [
        {
          id: "step-1",
          action: {
            kind: "collect.jobs",
            input: {
              containerSelector: ".list",
              itemSelector: ".card",
              detailsUrlField: "detailUrl",
              surfaceFields: [],
              detailsFields: [],
            },
          },
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects extra unknown properties (strict mode)", () => {
    const result = PlanSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      boardType: "Sequential",
      steps: [],
      stopWhen: "CatchUp",
    });

    expect(result.success).toBe(false);
  });
});
