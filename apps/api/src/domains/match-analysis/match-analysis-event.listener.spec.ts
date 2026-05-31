import { JobCreated } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import type { JobsRepository } from "@api/domains/jobs/jobs.repository";
import type { ResumeRepository } from "@api/domains/resumes/resumes.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";
import { MatchAnalysisEventListener } from "./match-analysis-event.listener";

describe("MatchAnalysisEventListener", () => {
  let jobEventBus: JobEventBus;
  let matchEventBus: MatchAnalysisEventBus;
  let jobRepo: Pick<JobsRepository, "findOneByIdAndUserId">;
  let resumeRepo: Pick<ResumeRepository, "findDefaultByUserId">;
  let matchService: Pick<MatchAnalysisService, "generate" | "processMatchAnalysis">;
  beforeEach(() => {
    jobEventBus = new JobEventBus();
    matchEventBus = new MatchAnalysisEventBus();
    jobRepo = { findOneByIdAndUserId: vi.fn().mockResolvedValue({ id: "job-1", htmlContent: "<p>JD</p>" }) };
    resumeRepo = { findDefaultByUserId: vi.fn().mockResolvedValue({ id: "resume-1" }) };
    matchService = {
      generate: vi.fn().mockResolvedValue(undefined),
      processMatchAnalysis: vi.fn().mockResolvedValue(undefined),
    };
  });

  function createListener() {
    return new MatchAnalysisEventListener(
      jobEventBus,
      matchEventBus,
      jobRepo as JobsRepository,
      resumeRepo as ResumeRepository,
      matchService as MatchAnalysisService,
    );
  }

  it("queues match analysis on JobCreated when autoMatch is true", async () => {
    createListener().onModuleInit();

    jobEventBus.emit(new JobCreated("job-1", "user-1", true));

    await vi.waitFor(() => expect(matchService.generate).toHaveBeenCalledWith("job-1", "resume-1", "user-1"));
  });

  it("does not queue match analysis on JobCreated when autoMatch is false", async () => {
    createListener().onModuleInit();

    jobEventBus.emit(new JobCreated("job-1", "user-1", false));

    expect(jobRepo.findOneByIdAndUserId).not.toHaveBeenCalled();
    expect(matchService.generate).not.toHaveBeenCalled();
  });
});
