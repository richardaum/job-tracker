import { beforeEach, describe, expect, it, vi } from "vitest";

import { FillJobEventListener } from "./fill-job-event.listener";
import { FillJobRequested } from "./job.events";
import type { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { JobEventBus } from "./job-event.bus";
import { JobsService } from "./jobs.service";

describe("FillJobEventListener", () => {
  let bus: JobEventBus;
  let jobsService: Pick<JobsService, "processFillJob">;

  beforeEach(() => {
    bus = new JobEventBus();
    jobsService = { processFillJob: vi.fn().mockResolvedValue(undefined) };
  });

  it("invokes resetStaleFillProcessing on init", async () => {
    const asyncMetadataRepo = {
      resetStaleFillProcessing: vi.fn().mockResolvedValue(7),
    } as unknown as JobAsyncMetadataRepository;

    new FillJobEventListener(
      bus,
      asyncMetadataRepo,
      jobsService as JobsService,
    ).onModuleInit();

    await vi.waitFor(() =>
      expect(asyncMetadataRepo.resetStaleFillProcessing).toHaveBeenCalledTimes(
        1,
      ),
    );
  });

  it("delegates FillJobRequested to processFillJob (async)", async () => {
    const asyncMetadataRepo = {
      resetStaleFillProcessing: vi.fn().mockResolvedValue(0),
    } as unknown as JobAsyncMetadataRepository;

    new FillJobEventListener(
      bus,
      asyncMetadataRepo,
      jobsService as JobsService,
    ).onModuleInit();
    await vi.waitFor(() =>
      expect(asyncMetadataRepo.resetStaleFillProcessing).toHaveBeenCalledTimes(
        1,
      ),
    );

    bus.emit(new FillJobRequested("job-x", "user-y"));

    await vi.waitFor(() =>
      expect(jobsService.processFillJob).toHaveBeenCalledWith(
        "user-y",
        "job-x",
      ),
    );
  });
});
