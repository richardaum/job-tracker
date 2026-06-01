import { describe, expect, it, vi } from "vitest";

import { PlanResolver } from "./plan.resolver";
import { PlanType } from "./plan.type";

describe("PlanResolver — @ResolveField templates on PlanType", () => {
  const planService = { findAll: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  const sourcesService = { listTemplatesForPlan: vi.fn() };
  const resolver = new PlanResolver(planService as never, sourcesService as never);

  it("calls sourcesService.listTemplatesForPlan per parent plan", async () => {
    vi.mocked(sourcesService.listTemplatesForPlan).mockResolvedValue([]);

    const result = await resolver.templates({ id: "plan-1" } as PlanType, { userId: "user-1" });

    expect(result).toEqual([]);
    expect(sourcesService.listTemplatesForPlan).toHaveBeenCalledWith("user-1", "plan-1");
  });
});
