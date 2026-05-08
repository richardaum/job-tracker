import { describe, expect, it, vi } from "vitest";

import { DraftApplicationsRepository } from "./draft-applications.repository";
import { DraftApplicationsService } from "./draft-applications.service";

describe("DraftApplicationsService", () => {
  it("onModuleInit resets stale processing draft conversions", async () => {
    const repo = {
      resetStaleProcessingDrafts: vi.fn().mockResolvedValue(2),
    } as unknown as DraftApplicationsRepository;
    const service = new DraftApplicationsService(repo);

    await service.onModuleInit();

    expect(repo.resetStaleProcessingDrafts).toHaveBeenCalledTimes(1);
  });
});
