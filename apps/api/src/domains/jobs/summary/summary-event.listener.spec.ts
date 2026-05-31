import { JobUpdated, SummaryGenerationRequested } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import type { JobsRepository } from "@api/domains/jobs/jobs.repository";
import type { SettingsService } from "@api/domains/settings/settings.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { JobSummaryService } from "./job-summary.service";
import { SummaryEventListener } from "./summary-event.listener";

describe("SummaryEventListener", () => {
  let bus: JobEventBus;
  let summaryService: Pick<JobSummaryService, "requestSummary" | "doGenerate">;
  let settingsService: Pick<SettingsService, "getSettings">;
  let jobsRepository: Pick<JobsRepository, "findOneByIdAndUserId">;

  beforeEach(() => {
    bus = new JobEventBus();
    summaryService = {
      requestSummary: vi.fn().mockResolvedValue(undefined),
      doGenerate: vi.fn().mockResolvedValue(undefined),
    };
    settingsService = { getSettings: vi.fn().mockResolvedValue({ autoSummaryEnabled: true }) };
    jobsRepository = { findOneByIdAndUserId: vi.fn().mockResolvedValue({ stage: ApplicationStageEnum.New }) };
  });

  function createListener() {
    return new SummaryEventListener(
      bus,
      summaryService as JobSummaryService,
      settingsService as SettingsService,
      jobsRepository as JobsRepository,
    );
  }

  it("generates summary on JobUpdated when autoSummaryEnabled is true", async () => {
    createListener().onModuleInit();

    bus.emit(new JobUpdated("job-x", "user-y"));

    await vi.waitFor(() => expect(settingsService.getSettings).toHaveBeenCalledWith("user-y"));
    await vi.waitFor(() => expect(summaryService.requestSummary).toHaveBeenCalledWith("job-x", "user-y"));
  });

  it("skips summary generation on JobUpdated when autoSummaryEnabled is false", async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue({ autoSummaryEnabled: false } as Awaited<
      ReturnType<SettingsService["getSettings"]>
    >);

    createListener().onModuleInit();

    bus.emit(new JobUpdated("job-x", "user-y"));

    await vi.waitFor(() => expect(settingsService.getSettings).toHaveBeenCalledWith("user-y"));
    expect(summaryService.requestSummary).not.toHaveBeenCalled();
  });

  it("skips summary generation when job stage is Duplicated", async () => {
    vi.mocked(jobsRepository.findOneByIdAndUserId).mockResolvedValue({
      stage: ApplicationStageEnum.Duplicated,
    } as Awaited<ReturnType<JobsRepository["findOneByIdAndUserId"]>>);

    createListener().onModuleInit();

    bus.emit(new JobUpdated("job-x", "user-y"));

    await vi.waitFor(() => expect(jobsRepository.findOneByIdAndUserId).toHaveBeenCalledWith("job-x", "user-y"));
    expect(summaryService.requestSummary).not.toHaveBeenCalled();
  });

  it("delegates SummaryGenerationRequested to doGenerate", async () => {
    createListener().onModuleInit();

    bus.emit(new SummaryGenerationRequested("job-x", "user-y"));

    await vi.waitFor(() => expect(summaryService.doGenerate).toHaveBeenCalledWith("job-x", "user-y"));
    expect(settingsService.getSettings).not.toHaveBeenCalled();
  });
});
