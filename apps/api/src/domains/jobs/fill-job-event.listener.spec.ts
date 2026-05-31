import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FillJobEventListener } from "./fill-job-event.listener";
import { FillJobStatusChanged } from "./job.events";
import type { JobAutomaticFillService } from "./job-automatic-fill.service";
import { JobEventBus } from "./job-event.bus";

describe("FillJobEventListener", () => {
  let bus: JobEventBus;
  let fillService: Pick<JobAutomaticFillService, "processFillJob">;

  beforeEach(() => {
    bus = new JobEventBus();
    fillService = { processFillJob: vi.fn().mockResolvedValue(undefined) };
  });

  it("delegates FillJobStatusChanged PROCESSING to processFillJob (async)", async () => {
    new FillJobEventListener(bus, fillService as JobAutomaticFillService).onModuleInit();

    bus.emit(new FillJobStatusChanged("job-x", "user-y", AsyncMetadataStatusEnum.Processing));

    await vi.waitFor(() => expect(fillService.processFillJob).toHaveBeenCalledWith("user-y", "job-x"));
  });

  it("ignores FillJobStatusChanged COMPLETED", () => {
    new FillJobEventListener(bus, fillService as JobAutomaticFillService).onModuleInit();

    bus.emit(new FillJobStatusChanged("job-x", "user-y", AsyncMetadataStatusEnum.Completed));

    expect(fillService.processFillJob).not.toHaveBeenCalled();
  });
});
