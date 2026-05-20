import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { DraftJobsRepository } from "@api/domains/draft-jobs/draft-jobs.repository";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatchAnalysisRepository } from "./match-analysis.repository";
import { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisAiService } from "./match-analysis-ai.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";

describe("MatchAnalysisService", () => {
  let service: MatchAnalysisService;
  let repo: MatchAnalysisRepository;

  beforeEach(() => {
    repo = {
      resetStaleProcessing: vi.fn(),
      findByJobId: vi.fn(),
      upsert: vi.fn(),
      updateStatus: vi.fn(),
      findById: vi.fn(),
      findByDraftJobId: vi.fn(),
      updateStatusById: vi.fn(),
    } as unknown as MatchAnalysisRepository;

    service = new MatchAnalysisService(
      repo,
      {} as MatchAnalysisAiService,
      {} as JobsRepository,
      {} as DraftJobsRepository,
      {} as MatchAnalysisEventBus,
      {} as Repository<ResumeEntity>,
      {} as Repository<WorkPreferencesEntity>,
    );
  });

  it("onModuleInit resets stale processing records", async () => {
    vi.mocked(repo.resetStaleProcessing).mockResolvedValue(3);
    const loggerWarnSpy = vi
      .spyOn(Logger.prototype, "warn")
      .mockImplementation(() => {});

    await service.onModuleInit();

    expect(repo.resetStaleProcessing).toHaveBeenCalledTimes(1);
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Recovered 3 stale match analysis records"),
    );
  });
});
