import { describe, expect, it, vi } from "vitest";

import { PlanResolver } from "./plan.resolver";
import { PlanType } from "./plan.type";

describe("PlanResolver — @ResolveField templates on PlanType", () => {
  const planService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const templatesLoader = { load: vi.fn() };
  const resolver = new PlanResolver(planService as never, templatesLoader as never);

  it("calls templatesLoader.load per parent plan (batched via DataLoader)", async () => {
    vi.mocked(templatesLoader.load).mockResolvedValue([]);

    const result = await resolver.templates({ id: "plan-1" } as PlanType, {
      userId: "user-1",
    });

    expect(result).toEqual([]);
    expect(templatesLoader.load).toHaveBeenCalledWith("plan-1");
  });
});
