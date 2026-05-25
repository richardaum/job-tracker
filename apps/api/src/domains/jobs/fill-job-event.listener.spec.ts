import { beforeEach, describe, expect, it, vi } from "vitest";

import { FillJobEventListener } from "./fill-job-event.listener";
import { FillJobRequested } from "./job.events";
import type { JobAutomaticFillService } from "./job-automatic-fill.service";
import { JobEventBus } from "./job-event.bus";

describe("FillJobEventListener", () => {
  let bus: JobEventBus;
  let fillService: Pick<JobAutomaticFillService, "processFillJob">;

  beforeEach(() => {
    bus = new JobEventBus();
    fillService = { processFillJob: vi.fn().mockResolvedValue(undefined) };
  });

  it("delegates FillJobRequested to processFillJob (async)", async () => {
    new FillJobEventListener(
      bus,
      fillService as JobAutomaticFillService,
    ).onModuleInit();

    bus.emit(new FillJobRequested("job-x", "user-y"));

    await vi.waitFor(() =>
      expect(fillService.processFillJob).toHaveBeenCalledWith(
        "user-y",
        "job-x",
      ),
    );
  });
});
