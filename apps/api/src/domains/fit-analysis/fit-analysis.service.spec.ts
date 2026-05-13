import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { DraftApplicationsRepository } from "@api/domains/draft-applications/draft-applications.repository";
import { Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FitAnalysisRepository } from "./fit-analysis.repository";
import { FitAnalysisService } from "./fit-analysis.service";
import { FitAnalysisAiService } from "./fit-analysis-ai.service";

describe("FitAnalysisService", () => {
  let service: FitAnalysisService;
  let repo: FitAnalysisRepository;

  beforeEach(() => {
    repo = {
      resetStaleProcessing: vi.fn(),
      findByApplicationId: vi.fn(),
      upsert: vi.fn(),
      updateStatus: vi.fn(),
      findById: vi.fn(),
      findByDraftApplicationId: vi.fn(),
      updateStatusById: vi.fn(),
    } as unknown as FitAnalysisRepository;

    service = new FitAnalysisService(
      repo,
      {} as FitAnalysisAiService,
      {} as ApplicationRepository,
      {} as DraftApplicationsRepository,
      {} as Repository<ResumeEntity>,
      {} as Repository<UserPreferencesEntity>,
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
      expect.stringContaining("Recovered 3 stale fit analysis records"),
    );
  });
});
