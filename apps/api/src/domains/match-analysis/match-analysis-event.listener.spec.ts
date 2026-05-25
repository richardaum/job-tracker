import { JobCreated } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import type { JobsRepository } from "@api/domains/jobs/jobs.repository";
import type { ResumeRepository } from "@api/domains/resumes/resumes.repository";
import type { SettingsService } from "@api/domains/settings/settings.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";
import { MatchAnalysisEventListener } from "./match-analysis-event.listener";

describe("MatchAnalysisEventListener", () => {
  let jobEventBus: JobEventBus;
  let matchEventBus: MatchAnalysisEventBus;
  let jobRepo: Pick<JobsRepository, "findOneByIdAndUserId">;
  let resumeRepo: Pick<ResumeRepository, "findDefaultByUserId">;
  let matchService: Pick<
    MatchAnalysisService,
    "generate" | "processMatchAnalysis"
  >;
  let settingsService: Pick<SettingsService, "getSettings">;

  beforeEach(() => {
    jobEventBus = new JobEventBus();
    matchEventBus = new MatchAnalysisEventBus();
    jobRepo = {
      findOneByIdAndUserId: vi
        .fn()
        .mockResolvedValue({ id: "job-1", htmlContent: "<p>JD</p>" }),
    };
    resumeRepo = {
      findDefaultByUserId: vi.fn().mockResolvedValue({ id: "resume-1" }),
    };
    matchService = {
      generate: vi.fn().mockResolvedValue(undefined),
      processMatchAnalysis: vi.fn().mockResolvedValue(undefined),
    };
    settingsService = {
      getSettings: vi.fn().mockResolvedValue({ autoMatchEnabled: true }),
    };
  });

  function createListener() {
    return new MatchAnalysisEventListener(
      jobEventBus,
      matchEventBus,
      jobRepo as JobsRepository,
      resumeRepo as ResumeRepository,
      matchService as MatchAnalysisService,
      settingsService as SettingsService,
    );
  }

  it("queues match analysis on JobCreated when autoMatchEnabled is true", async () => {
    createListener().onModuleInit();

    jobEventBus.emit(new JobCreated("job-1", "user-1"));

    await vi.waitFor(() =>
      expect(settingsService.getSettings).toHaveBeenCalledWith("user-1"),
    );
    await vi.waitFor(() =>
      expect(matchService.generate).toHaveBeenCalledWith(
        "job-1",
        "resume-1",
        "user-1",
      ),
    );
  });

  it("skips match analysis on JobCreated when autoMatchEnabled is false", async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue({
      autoMatchEnabled: false,
    } as Awaited<ReturnType<SettingsService["getSettings"]>>);

    createListener().onModuleInit();

    jobEventBus.emit(new JobCreated("job-1", "user-1"));

    await vi.waitFor(() =>
      expect(settingsService.getSettings).toHaveBeenCalledWith("user-1"),
    );
    expect(jobRepo.findOneByIdAndUserId).not.toHaveBeenCalled();
    expect(matchService.generate).not.toHaveBeenCalled();
  });

  it("skips match analysis on JobCreated when autoMatch is false", async () => {
    createListener().onModuleInit();

    jobEventBus.emit(new JobCreated("job-1", "user-1", false));

    await vi.waitFor(() =>
      expect(settingsService.getSettings).toHaveBeenCalledWith("user-1"),
    );
    expect(jobRepo.findOneByIdAndUserId).not.toHaveBeenCalled();
    expect(matchService.generate).not.toHaveBeenCalled();
  });
});
