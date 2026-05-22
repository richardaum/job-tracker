import { beforeEach, describe, expect, it, vi } from "vitest";

import { FillJobEventListener } from "./fill-job-event.listener";
import { FillJobRequested } from "./job.events";
import { JobEventBus } from "./job-event.bus";
import type { JobsRepository } from "./jobs.repository";
import { JobsService } from "./jobs.service";

describe("FillJobEventListener", () => {
  let bus: JobEventBus;
  let jobsService: Pick<JobsService, "processFillJob">;

  beforeEach(() => {
    bus = new JobEventBus();
    jobsService = { processFillJob: vi.fn().mockResolvedValue(undefined) };
  });

  it("invokes resetStaleFillProcessing on init", async () => {
    const repo = {
      resetStaleFillProcessing: vi.fn().mockResolvedValue(7),
    } as unknown as JobsRepository;

    new FillJobEventListener(
      bus,
      repo,
      jobsService as JobsService,
    ).onModuleInit();

    await vi.waitFor(() =>
      expect(repo.resetStaleFillProcessing).toHaveBeenCalledTimes(1),
    );
  });

  it("delegates FillJobRequested to processFillJob (async)", async () => {
    const repo = {
      resetStaleFillProcessing: vi.fn().mockResolvedValue(0),
    } as unknown as JobsRepository;

    new FillJobEventListener(
      bus,
      repo,
      jobsService as JobsService,
    ).onModuleInit();
    await vi.waitFor(() =>
      expect(repo.resetStaleFillProcessing).toHaveBeenCalledTimes(1),
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
