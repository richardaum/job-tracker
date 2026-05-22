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

  it("maps draft GraphQL payload jobId via unified PK (same row id)", async () => {
    const createdAt = new Date("2020-01-01");
    const updatedAt = new Date("2020-01-02");
    const row = {
      id: "draft-pk",
      url: null,
      title: "t",
      htmlContent: "",
      userId: "u",
      conversionMetadata: null,
      createdAt,
      updatedAt,
    };
    const repo = {
      findOne: vi.fn().mockResolvedValue(row),
      findLatestJobIdByDraftId: vi.fn().mockResolvedValue("draft-pk"),
    } as unknown as DraftJobsRepository;
    const service = new DraftJobsService(repo);

    const result = await service.findOne("draft-pk", "u");

    expect(repo.findLatestJobIdByDraftId).toHaveBeenCalledWith("draft-pk");
    expect(result.jobId).toBe("draft-pk");
    expect(result.id).toBe("draft-pk");
  });
});
