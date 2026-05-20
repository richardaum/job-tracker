import { describe, expect, it, vi } from "vitest";

import { DraftJobsRepository } from "./draft-jobs.repository";
import { DraftJobsService } from "./draft-jobs.service";

describe("DraftJobsService", () => {
  it("onModuleInit resets stale processing draft conversions", async () => {
    const repo = {
      resetStaleProcessingDrafts: vi.fn().mockResolvedValue(2),
    } as unknown as DraftJobsRepository;
    const service = new DraftJobsService(repo);

    await service.onModuleInit();

    expect(repo.resetStaleProcessingDrafts).toHaveBeenCalledTimes(1);
  });
});
