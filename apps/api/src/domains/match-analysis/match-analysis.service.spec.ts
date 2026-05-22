import {
  MatchAnalysisEntity,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { BadRequestException, Logger } from "@nestjs/common";
import type { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FitVerdictEnum } from "./fit-verdict.enum";
import { MatchAnalysisRequested } from "./match-analysis.events";
import { MatchAnalysisRepository } from "./match-analysis.repository";
import { MatchAnalysisService } from "./match-analysis.service";
import type { ResumeMatchItemParsed } from "./match-analysis-ai.schema";
import { MatchAnalysisAiService } from "./match-analysis-ai.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";

describe("MatchAnalysisService", () => {
  let service: MatchAnalysisService;
  let repo: MatchAnalysisRepository;
  let aiService: MatchAnalysisAiService;
  let jobRepo: JobsRepository;
  let eventBus: MatchAnalysisEventBus;
  let eventEmit: ReturnType<typeof vi.fn>;
  let resumeRepo: Repository<ResumeEntity>;
  let preferencesRepo: Repository<WorkPreferencesEntity>;

  const resumeTiTap = JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Resume line" }] },
    ],
  });

  const jobDescription = JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Need Rust" }] },
    ],
  });

  beforeEach(() => {
    repo = {
      resetStaleProcessing: vi.fn(),
      findByJobId: vi.fn(),
      findByDraftJobId: vi.fn(),
      upsert: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn(),
    } as unknown as MatchAnalysisRepository;

    aiService = {
      extractResumeMatchItems: vi.fn(),
      extractPreferenceMatchItems: vi.fn().mockResolvedValue([]),
    } as unknown as MatchAnalysisAiService;

    jobRepo = { findOneByIdAndUserId: vi.fn() } as unknown as JobsRepository;
    eventEmit = vi.fn();

    eventBus = { emit: eventEmit } as unknown as MatchAnalysisEventBus;

    resumeRepo = { findOne: vi.fn() } as unknown as Repository<ResumeEntity>;

    preferencesRepo = {
      findOne: vi.fn(),
    } as unknown as Repository<WorkPreferencesEntity>;

    service = new MatchAnalysisService(
      repo,
      aiService,
      jobRepo,
      eventBus,
      resumeRepo,
      preferencesRepo,
    );
  });

  it("onModuleInit resets stale processing records", async () => {
    vi.mocked(repo.resetStaleProcessing).mockResolvedValue(3);
    const loggerWarnSpy = vi
      .spyOn(Logger.prototype, "warn")
      .mockImplementation(() => {});

    try {
      await service.onModuleInit();

      expect(repo.resetStaleProcessing).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recovered 3 stale match analysis records"),
      );
    } finally {
      loggerWarnSpy.mockRestore();
    }
  });

  it("generate throws when description missing", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      description: "",
    } as never);

    await expect(service.generate("job-1", "res-1", "user-1")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("generate rejects missing resume lookups", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      description: jobDescription,
    } as never);

    vi.mocked(resumeRepo.findOne).mockResolvedValue(null);

    await expect(service.generate("job-1", "res-z", "user-1")).rejects.toThrow(
      "Resume not found",
    );
  });

  it("generate rejects missing job lookups", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue(null);

    await expect(service.generate("job-z", "res-1", "user-1")).rejects.toThrow(
      "Job not found",
    );
  });

  it("generate upserts match and emits PROCESSING lifecycle", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      description: jobDescription,
    } as never);
    vi.mocked(resumeRepo.findOne).mockResolvedValue({
      id: "res-1",
      userId: "user-1",
      content: resumeTiTap,
    } as ResumeEntity);

    vi.mocked(repo.findByJobId).mockResolvedValue(null);
    const saved = Object.assign(new MatchAnalysisEntity(), {
      id: "m-new",
      userId: "user-1",
      jobId: "job-1",
    });
    vi.mocked(repo.upsert).mockResolvedValue(saved);

    await service.generate("job-1", "res-1", "user-1");

    expect(repo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job-1",
        generationMetadata: expect.objectContaining({
          status: AsyncMetadataStatusEnum.PROCESSING,
        }),
      }),
    );
    expect(eventEmit).toHaveBeenCalled();
    const sources = matchSourcesFromEmit(eventEmit);
    expect(sources.some((s) => s.jobId === "job-1")).toBe(true);
  });

  it("generateForDraft delegates to generate — missing job IDs fail", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue(null);

    await expect(
      service.generateForDraft("missing", "res-1", "user-1"),
    ).rejects.toThrow("Job not found");
  });

  it("generateForDraft delegates to generate — needs description or captured HTML", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-draft",
      description: "",
      htmlContent: "",
    } as never);

    await expect(
      service.generateForDraft("job-draft", "res-1", "user-1"),
    ).rejects.toThrow("Job has no captured HTML or job description");
  });

  it("generateForDraft delegates to generate and emits job lifecycle", async () => {
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-draft",
      description: "",
      htmlContent: "<p>Rust role</p>",
    } as never);

    vi.mocked(resumeRepo.findOne).mockResolvedValue({
      id: "res-1",
      content: resumeTiTap,
      userId: "user-1",
    } as ResumeEntity);

    vi.mocked(repo.findByJobId).mockResolvedValue(null);

    const saved = Object.assign(new MatchAnalysisEntity(), {
      id: "m-draft",
      jobId: "job-draft",
    });

    vi.mocked(repo.upsert).mockResolvedValue(saved);

    await service.generateForDraft("job-draft", "res-1", "user-1");

    expect(repo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: "job-draft" }),
    );
    const sources = matchSourcesFromEmit(eventEmit);
    expect(sources.some((s) => s.jobId === "job-draft")).toBe(true);
  });

  it("processMatchAnalysis uses JD text from TipTap description for job sources", async () => {
    vi.mocked(preferencesRepo.findOne).mockResolvedValue({
      items: [],
    } as unknown as WorkPreferencesEntity);
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      description: jobDescription,
    } as never);

    vi.mocked(repo.findById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), {
        id: "m1",
        resumeId: "res-1",
        userId: "user-1",
      }),
    );
    vi.mocked(resumeRepo.findOne).mockResolvedValue({
      id: "res-1",
      userId: "user-1",
      content: resumeTiTap,
    } as ResumeEntity);

    vi.mocked(aiService.extractResumeMatchItems).mockResolvedValue([
      makeResumeParsed("Rust"),
    ]);

    vi.mocked(repo.updateById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), { id: "m1" }),
    );

    await service.processMatchAnalysis("m1", "user-1", { jobId: "job-1" });

    expect(aiService.extractResumeMatchItems).toHaveBeenCalled();
    expect(
      vi.mocked(aiService.extractResumeMatchItems).mock.calls[0][0],
    ).toContain("Need Rust");
  });

  it("processMatchAnalysis prefers htmlContent over TipTap descriptions", async () => {
    vi.mocked(preferencesRepo.findOne).mockResolvedValue({
      items: [],
    } as unknown as WorkPreferencesEntity);

    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-html",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "IGNORE DESCRIPTION" }],
          },
        ],
      }),
      htmlContent: "<p>Hello <strong>World</strong></p>",
    } as never);

    vi.mocked(repo.findById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), { id: "m1", resumeId: "res-2" }),
    );
    vi.mocked(resumeRepo.findOne).mockResolvedValue({
      id: "res-2",
      userId: "user-1",
      content: resumeTiTap,
    } as ResumeEntity);

    vi.mocked(aiService.extractResumeMatchItems).mockResolvedValue([
      makeResumeParsed("World"),
    ]);
    vi.mocked(repo.updateById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), { id: "m1" }),
    );

    await service.processMatchAnalysis("m1", "user-1", { jobId: "job-html" });

    expect(aiService.extractResumeMatchItems).toHaveBeenCalled();
    expect(
      vi.mocked(aiService.extractResumeMatchItems).mock.calls[0][0],
    ).toContain("Hello World");

    expect(aiService.extractPreferenceMatchItems).toHaveBeenCalledWith(
      expect.any(String),
      [],
    );
  });

  it("processMatchAnalysis returns early when JD source unspecified", async () => {
    vi.mocked(preferencesRepo.findOne).mockResolvedValue({
      items: [],
    } as unknown as WorkPreferencesEntity);

    await service.processMatchAnalysis("m1", "user-1", {});

    expect(aiService.extractResumeMatchItems).not.toHaveBeenCalled();
  });

  it("processMatchAnalysis stops when persisted record lacks resumeId", async () => {
    vi.mocked(preferencesRepo.findOne).mockResolvedValue({
      items: [],
    } as unknown as WorkPreferencesEntity);
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      description: jobDescription,
    } as never);

    vi.mocked(repo.findById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), {
        id: "m1",
        resumeId: undefined,
      }),
    );

    await service.processMatchAnalysis("m1", "user-1", { jobId: "job-1" });

    expect(aiService.extractResumeMatchItems).not.toHaveBeenCalled();
  });

  it("processMatchAnalysis marks FAILED when AI throws", async () => {
    vi.mocked(preferencesRepo.findOne).mockResolvedValue({
      items: [],
    } as unknown as WorkPreferencesEntity);
    vi.mocked(jobRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      description: jobDescription,
    } as never);

    vi.mocked(repo.findById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), { id: "m1", resumeId: "res-1" }),
    );

    vi.mocked(resumeRepo.findOne).mockResolvedValue({
      id: "res-1",
      userId: "user-1",
      content: resumeTiTap,
    } as ResumeEntity);

    vi.mocked(aiService.extractResumeMatchItems).mockRejectedValue(
      new Error("LLM outage"),
    );
    vi.mocked(repo.updateById).mockResolvedValue(
      Object.assign(new MatchAnalysisEntity(), { id: "m1" }),
    );

    await service.processMatchAnalysis("m1", "user-1", { jobId: "job-1" });

    expect(repo.updateById).toHaveBeenCalledWith(
      "m1",
      AsyncMetadataStatusEnum.PROCESSING,
      expect.objectContaining({
        generationMetadata: expect.objectContaining({
          status: AsyncMetadataStatusEnum.FAILED,
          error: "LLM outage",
        }),
      }),
      "user-1",
    );
  });

  function makeResumeParsed(requirement: string): ResumeMatchItemParsed {
    return {
      requirement,
      type: RequirementTypeEnum.MustHave,
      verdict: FitVerdictEnum.Fit,
      jdQuote: requirement,
      sourceQuotes: [],
      suggestion: null,
    };
  }
});

type MatchRequestedSource = { jobId?: string; draftJobId?: string };

function matchSourcesFromEmit(
  spy: ReturnType<typeof vi.fn>,
): MatchRequestedSource[] {
  const out: MatchRequestedSource[] = [];
  for (const args of spy.mock.calls) {
    const ev = args[0];
    if (ev instanceof MatchAnalysisRequested) out.push(ev.source);
  }
  return out;
}
