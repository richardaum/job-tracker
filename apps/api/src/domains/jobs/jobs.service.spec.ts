import { DraftJobConversionStatusEnum } from "@api/database/entities/draft-job-conversion.enum";
import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import {
  DraftConversionRequested,
  DraftConversionStatusChanged,
} from "@api/domains/draft-jobs/draft-job.events";
import { DraftJobEventBus } from "@api/domains/draft-jobs/draft-job-event.bus";
import { DraftJobsService } from "@api/domains/draft-jobs/draft-jobs.service";
import { DraftExtractionService } from "@api/domains/jobs/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/jobs/ai/draft-extraction-normalization.service";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { LocationInferenceService } from "@api/lib/ai";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Repository, UpdateResult } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobCreated } from "./job.events";
import { JobEventBus } from "./job-event.bus";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEvent } from "./job-stage-events.schema";
import { JobsRepository } from "./jobs.repository";
import { Job } from "./jobs.schema";
import { JobsService } from "./jobs.service";
import { SalaryService } from "./salary/salary.service";
import { StageEventSourceEnum } from "./stage-event-source.enum";
import { TagService } from "./tags/tag.service";

const makeJob = (overrides: Partial<Job> = {}): Job =>
  ({
    id: "app-1",
    userId: "user-1",
    title: "Engineer",
    companyId: "company-1",
    company: {
      id: "company-1",
      name: "Acme",
      userId: "user-1",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    description: null,
    urls: [],
    source: null,
    salaryMinCents: null,
    salaryMaxCents: null,
    salaryCurrency: null,
    salaryPeriod: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceRunId: null,
    ...overrides,
  }) as unknown as Job;

const makeEvent = (overrides: Partial<JobStageEvent> = {}): JobStageEvent =>
  ({
    id: "event-1",
    jobId: "app-1",
    userId: "user-1",
    fromStage: null,
    toStage: ApplicationStageEnum.NEW,
    source: StageEventSourceEnum.Manual,
    reason: null,
    createdAt: new Date("2026-01-02"),
    ...overrides,
    scheduledAt: overrides.scheduledAt ?? null,
  }) as unknown as JobStageEvent;

describe("JobsService", () => {
  let service: JobsService;
  let sourceRunsRepo: Pick<Repository<SourceRunEntity>, "findOne">;
  let repo: JobsRepository;
  let companyService: CompanyService;
  let salaryService: SalaryService;
  let tagService: TagService;
  let companyDescriptionService: CompanyDescriptionService;
  let draftJobsService: DraftJobsService;
  let draftExtractionService: DraftExtractionService;
  let draftExtractionNormalizationService: DraftExtractionNormalizationService;
  let locationInferenceService: LocationInferenceService;
  let matchAnalysisRepo: Pick<Repository<MatchAnalysisEntity>, "update">;
  let draftEventBusEmit: ReturnType<typeof vi.fn>;
  let jobEventBusEmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sourceRunsRepo = { findOne: vi.fn().mockResolvedValue(null) };

    repo = {
      findAllByUserId: vi.fn(),
      findOneByIdAndUserId: vi.fn(),
      findLatestStageSummariesByJobIds: vi.fn().mockResolvedValue(new Map()),
      hasRecentDuplicateSameRoleAndCompany: vi.fn().mockResolvedValue(false),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findStageEventsByJobIdAndUserId: vi.fn(),
      findLatestStageEventByJobIdAndUserId: vi.fn(),
      findStageEventByIdAndUserId: vi.fn(),
      setPersistedStage: vi.fn().mockResolvedValue(undefined),
      createStageEvent: vi.fn(),
      updateStageEvent: vi.fn(),
      deleteStageEvent: vi.fn(),
      findUpToTwoJobPostingContextsByCompanyName: vi.fn().mockResolvedValue([]),
      beginFillAutomaticallyProcessing: vi.fn().mockResolvedValue(true),
    } as unknown as JobsRepository;

    companyService = {
      findOne: vi.fn(),
      findOrCreateByName: vi.fn(),
      update: vi.fn(),
    } as unknown as CompanyService;

    salaryService = new SalaryService();
    tagService = new TagService();
    companyDescriptionService = {
      generateCompanyDescription: vi.fn(),
    } as unknown as CompanyDescriptionService;
    draftJobsService = {
      findOne: vi.fn(),
      update: vi.fn(),
      updateConversionMetadata: vi.fn(),
    } as unknown as DraftJobsService;
    draftExtractionService = {
      extract: vi.fn(),
    } as unknown as DraftExtractionService;
    draftExtractionNormalizationService = {
      normalizeExtraction: vi.fn(),
    } as unknown as DraftExtractionNormalizationService;
    locationInferenceService = {
      inferLocation: vi.fn(),
      inferWorkRegion: vi.fn(),
    } as unknown as LocationInferenceService;

    draftEventBusEmit = vi.fn();
    jobEventBusEmit = vi.fn();

    const eventBus = {
      emit: jobEventBusEmit,
      emitJobCreated: vi.fn(),
    } as unknown as JobEventBus;

    const draftEventBus = {
      emit: draftEventBusEmit,
      emitDraftConversionStatusChanged: vi.fn(),
    } as unknown as DraftJobEventBus;

    matchAnalysisRepo = {
      update: vi.fn().mockResolvedValue({ affected: 1 } as UpdateResult),
    } as Pick<Repository<MatchAnalysisEntity>, "update">;

    service = new JobsService(
      sourceRunsRepo as unknown as Repository<SourceRunEntity>,
      matchAnalysisRepo as unknown as Repository<MatchAnalysisEntity>,
      repo,
      companyService,
      salaryService,
      tagService,
      companyDescriptionService,
      draftJobsService,
      draftExtractionService,
      draftExtractionNormalizationService,
      locationInferenceService,
      eventBus,
      draftEventBus,
    );
  });

  it("findAll delegates to repo and attaches current stage", async () => {
    const app = makeJob();
    vi.mocked(repo.findAllByUserId).mockResolvedValue([app]);
    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
    expect(repo.findAllByUserId).toHaveBeenCalledWith(
      "user-1",
      undefined,
      undefined,
      undefined,
    );
    expect(
      vi.mocked(repo.findLatestStageSummariesByJobIds),
    ).toHaveBeenCalledWith("user-1", [app.id]);
    expect(result[0]?.currentStage).toBe(ApplicationStageEnum.NEW);
  });

  it("findOne returns job when found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeJob());
    const result = await service.findOne("app-1", "user-1");
    expect(result.id).toBe("app-1");
    expect(
      vi.mocked(repo.findLatestStageSummariesByJobIds),
    ).toHaveBeenCalledWith("user-1", ["app-1"]);
    expect(result.currentStage).toBe(ApplicationStageEnum.NEW);
  });

  it("findOne throws NotFoundException when not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(service.findOne("app-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  describe("fillJobAutomatically", () => {
    it("throws BadRequestException when fill metadata is PROCESSING", async () => {
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(
        makeJob({
          fillMetadata: {
            status: AsyncMetadataStatusEnum.PROCESSING,
            error: null,
            timestamp: new Date(),
          },
        }),
      );

      await expect(
        service.fillJobAutomatically("user-1", "app-1"),
      ).rejects.toThrow(BadRequestException);

      expect(
        vi.mocked(repo.beginFillAutomaticallyProcessing),
      ).not.toHaveBeenCalled();
    });

    it("begins PROCESSING via repository CAS when restartable", async () => {
      const jobIdle = makeJob({ fillMetadata: undefined });
      const jobAfterProcessing = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
      });

      vi.mocked(repo.findOneByIdAndUserId)
        .mockResolvedValueOnce(jobIdle)
        .mockResolvedValueOnce(jobAfterProcessing);
      vi.mocked(repo.beginFillAutomaticallyProcessing).mockResolvedValue(true);

      const result = await service.fillJobAutomatically("user-1", "app-1");

      expect(
        vi.mocked(repo.beginFillAutomaticallyProcessing),
      ).toHaveBeenCalledWith("app-1", "user-1");
      expect(result.fillMetadata?.status).toBe(
        AsyncMetadataStatusEnum.PROCESSING,
      );
    });

    it("throws BadRequestException when CAS updates zero rows", async () => {
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(
        makeJob({
          fillMetadata: {
            status: AsyncMetadataStatusEnum.COMPLETED,
            error: null,
            timestamp: new Date(),
          },
        }),
      );
      vi.mocked(repo.beginFillAutomaticallyProcessing).mockResolvedValue(false);

      await expect(
        service.fillJobAutomatically("user-1", "app-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it("create persists job and emits initial New stage event", async () => {
    const app = makeJob();
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({
        toStage: ApplicationStageEnum.NEW,
        source: StageEventSourceEnum.System,
      }),
    );
    const result = await service.create("user-1", {
      title: "Engineer",
      company: "Acme",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "React role" }],
          },
        ],
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: app.id,
        currentStage: ApplicationStageEnum.NEW,
        currentStageReason: null,
      }),
    );
    expect(companyService.findOrCreateByName).toHaveBeenCalledWith(
      "user-1",
      "Acme",
    );
    expect(repo.setPersistedStage).toHaveBeenCalledWith(
      "user-1",
      app.id,
      ApplicationStageEnum.NEW,
    );
    expect(
      vi.mocked(repo.setPersistedStage).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(repo.createStageEvent).mock.invocationCallOrder[0]!,
    );
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", app.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: StageEventSourceEnum.System,
      reason: null,
      scheduledAt: null,
    });
    expect(repo.hasRecentDuplicateSameRoleAndCompany).toHaveBeenCalledWith(
      "user-1",
      app.id,
      app.company.id,
      "Engineer",
      expect.any(Date),
      expect.any(Number),
    );
  });

  it("create uses Duplicated initial stage when matching job exists in lookback window", async () => {
    const app = makeJob();
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      true,
    );
    vi.mocked(repo.findLatestStageSummariesByJobIds).mockResolvedValue(
      new Map([
        [
          app.id,
          {
            toStage: ApplicationStageEnum.DUPLICATED,
            reason: null,
            statusAt: new Date(),
          },
        ],
      ]),
    );
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({
        toStage: ApplicationStageEnum.DUPLICATED,
        source: StageEventSourceEnum.System,
      }),
    );
    const result = await service.create("user-1", {
      title: "Engineer",
      company: "Acme",
      description: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph", content: [] }],
      }),
    });
    expect(result.currentStage).toBe(ApplicationStageEnum.DUPLICATED);
    expect(repo.setPersistedStage).toHaveBeenCalledWith(
      "user-1",
      app.id,
      ApplicationStageEnum.DUPLICATED,
    );
    expect(
      vi.mocked(repo.setPersistedStage).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(repo.createStageEvent).mock.invocationCallOrder[0]!,
    );
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", app.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.DUPLICATED,
      source: StageEventSourceEnum.System,
      reason: null,
      scheduledAt: null,
    });
  });

  it("update throws NotFoundException when job not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(
      service.update("app-1", "user-1", { title: "X" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("create throws for invalid TipTap description JSON", async () => {
    await expect(
      service.create("user-1", {
        title: "Engineer",
        company: "Acme",
        description: "plain text",
      }),
    ).rejects.toThrow("description must be valid TipTap document JSON");
  });

  it("generateCompanyDescription loads postings and forwards to company AI", async () => {
    const snippets = [
      { title: "Engineer", plainTextDescription: "Product analytics team" },
    ];
    vi.mocked(
      repo.findUpToTwoJobPostingContextsByCompanyName,
    ).mockResolvedValue(snippets);
    vi.mocked(
      companyDescriptionService.generateCompanyDescription,
    ).mockResolvedValue("{}");

    await service.generateCompanyDescription("user-1", {
      companyName: "  Acme  ",
    });

    expect(
      repo.findUpToTwoJobPostingContextsByCompanyName,
    ).toHaveBeenCalledWith("user-1", "  Acme  ");
    expect(
      vi.mocked(companyDescriptionService.generateCompanyDescription),
    ).toHaveBeenCalledWith({
      companyName: "  Acme  ",
      jobPostingContexts: snippets,
    });
  });

  it("createJobWithAI marks draft as processing and returns immediately", async () => {
    vi.mocked(draftJobsService.findOne)
      .mockResolvedValueOnce({
        id: "draft-1",
        jobId: null,
        title: "Page title",
        url: "https://jobs.example.com/x",
        htmlContent: "<p>Posting</p>",
        conversionMetadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "draft-1",
        jobId: null,
        title: "Page title",
        url: "https://jobs.example.com/x",
        htmlContent: "<p>Posting</p>",
        conversionMetadata: {
          status: DraftJobConversionStatusEnum.PROCESSING,
          error: null,
          timestamp: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    vi.mocked(draftJobsService.updateConversionMetadata).mockResolvedValue(
      true,
    );
    vi.mocked(draftExtractionService.extract).mockRejectedValue(
      new Error("openai down"),
    );

    const result = await service.createJobWithAI("user-1", "draft-1");

    expect(result.conversionMetadata?.status).toBe(
      DraftJobConversionStatusEnum.PROCESSING,
    );
    expect(draftJobsService.updateConversionMetadata).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      null,
      { status: DraftJobConversionStatusEnum.PROCESSING },
    );

    expect(draftEventBusEmit.mock.calls).toHaveLength(2);

    expect(draftEventBusEmit.mock.calls[0][0]).toBeInstanceOf(
      DraftConversionStatusChanged,
    );
    expect(
      draftEventBusEmit.mock.calls[0][0] as DraftConversionStatusChanged,
    ).toMatchObject({
      draftId: "draft-1",
      userId: "user-1",
      status: DraftJobConversionStatusEnum.PROCESSING,
    });

    expect(draftEventBusEmit.mock.calls[1][0]).toBeInstanceOf(
      DraftConversionRequested,
    );
  });

  it("createJobWithAI background conversion records Applied after New", async () => {
    const app = makeJob({ id: "draft-1" });
    const idleDraft = {
      id: "draft-1",
      jobId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const processingDraft = {
      ...idleDraft,
      conversionMetadata: {
        status: DraftJobConversionStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
    };
    vi.mocked(draftJobsService.findOne)
      .mockResolvedValueOnce(idleDraft as never)
      .mockResolvedValueOnce(processingDraft as never)
      .mockResolvedValue(processingDraft as never);
    vi.mocked(draftJobsService.updateConversionMetadata).mockResolvedValue(
      true,
    );
    vi.mocked(draftExtractionService.extract).mockResolvedValue({
      title: "Senior Engineer",
      company: "Acme",
      url: "https://jobs.example.com/x",
      description: "Job description",
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(
      draftExtractionNormalizationService.normalizeExtraction,
    ).mockReturnValue({
      title: "Senior Engineer",
      company: "Acme",
      description: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      false,
    );
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent)
      .mockResolvedValueOnce(
        makeEvent({
          toStage: ApplicationStageEnum.NEW,
          source: StageEventSourceEnum.System,
        }),
      )
      .mockResolvedValueOnce(
        makeEvent({
          fromStage: ApplicationStageEnum.NEW,
          toStage: ApplicationStageEnum.APPLIED,
          source: StageEventSourceEnum.System,
        }),
      );
    vi.mocked(repo.findLatestStageEventByJobIdAndUserId).mockResolvedValue(
      makeEvent({
        toStage: ApplicationStageEnum.NEW,
        source: StageEventSourceEnum.System,
      }),
    );

    await service.createJobWithAI("user-1", "draft-1");
    await service.processDraftConversion("user-1", "draft-1");

    expect(draftJobsService.updateConversionMetadata).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      null,
      { status: DraftJobConversionStatusEnum.PROCESSING },
    );

    expect(draftJobsService.updateConversionMetadata).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      { status: DraftJobConversionStatusEnum.PROCESSING },
      expect.objectContaining({
        status: DraftJobConversionStatusEnum.SUCCEEDED,
      }),
    );

    expect(repo.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ draftJobId: "draft-1" }),
    );

    expect(repo.setPersistedStage).toHaveBeenCalledWith(
      "user-1",
      "draft-1",
      ApplicationStageEnum.NEW,
    );
    expect(
      vi.mocked(repo.setPersistedStage).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(repo.createStageEvent).mock.invocationCallOrder[0]!,
    );

    expect(matchAnalysisRepo.update).toHaveBeenCalledWith(
      { jobId: "draft-1" },
      { jobId: app.id },
    );

    expect(
      jobEventBusEmit.mock.calls.some(([e]) => e instanceof JobCreated),
    ).toBe(false);

    expect(repo.createStageEvent).toHaveBeenNthCalledWith(
      1,
      "user-1",
      app.id,
      expect.objectContaining({
        fromStage: null,
        toStage: ApplicationStageEnum.NEW,
        source: StageEventSourceEnum.System,
      }),
    );
    expect(repo.createStageEvent).toHaveBeenNthCalledWith(
      2,
      "user-1",
      app.id,
      expect.objectContaining({
        fromStage: ApplicationStageEnum.NEW,
        toStage: ApplicationStageEnum.APPLIED,
        source: StageEventSourceEnum.System,
      }),
    );

    expect(draftJobsService.update).toHaveBeenCalledWith("draft-1", "user-1", {
      title: "Engineer @ Acme",
    });
  });

  it("processDraftConversion draft title omits null job title (uses @ company)", async () => {
    const createdJob = makeJob({
      id: "draft-null-title",
      title: null as never,
    });
    const idleDraft = {
      id: "draft-null-title",
      jobId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const processingDraft = {
      ...idleDraft,
      conversionMetadata: {
        status: DraftJobConversionStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
    };
    vi.mocked(draftJobsService.findOne)
      .mockResolvedValueOnce(idleDraft as never)
      .mockResolvedValueOnce(processingDraft as never)
      .mockResolvedValue(processingDraft as never);
    vi.mocked(draftJobsService.updateConversionMetadata).mockResolvedValue(
      true,
    );
    vi.mocked(draftExtractionService.extract).mockResolvedValue({
      title: "",
      company: "Acme",
      url: "https://jobs.example.com/x",
      description: "Job description",
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(
      draftExtractionNormalizationService.normalizeExtraction,
    ).mockReturnValue({
      title: "",
      company: "Acme",
      description: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(
      createdJob.company,
    );
    vi.mocked(repo.create).mockResolvedValue(createdJob);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      false,
    );
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(createdJob);
    vi.mocked(repo.createStageEvent).mockResolvedValue(makeEvent());

    vi.mocked(repo.findLatestStageEventByJobIdAndUserId).mockResolvedValue(
      makeEvent({
        jobId: "draft-null-title",
        toStage: ApplicationStageEnum.NEW,
        source: StageEventSourceEnum.System,
      }),
    );

    await service.createJobWithAI("user-1", "draft-null-title");
    await service.processDraftConversion("user-1", "draft-null-title");

    expect(draftJobsService.update).toHaveBeenCalledWith(
      "draft-null-title",
      "user-1",
      { title: "@ Acme" },
    );
  });

  it("processDraftConversion publishes FAILED conversion when extraction rejects", async () => {
    const processingDraft = {
      id: "draft-err",
      jobId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: {
        status: DraftJobConversionStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(draftJobsService.findOne).mockResolvedValue(
      processingDraft as never,
    );
    vi.mocked(draftExtractionService.extract).mockRejectedValue(
      new Error("no credits"),
    );
    vi.mocked(draftJobsService.updateConversionMetadata).mockResolvedValue(
      true,
    );

    await service.processDraftConversion("user-1", "draft-err");

    expect(draftJobsService.updateConversionMetadata).toHaveBeenCalledWith(
      "draft-err",
      "user-1",
      { status: DraftJobConversionStatusEnum.PROCESSING },
      expect.objectContaining({
        status: DraftJobConversionStatusEnum.FAILED,
        error: "no credits",
      }),
    );

    expect(
      draftEventBusEmit.mock.calls.some(
        ([event]) =>
          event instanceof DraftConversionStatusChanged &&
          event.status === DraftJobConversionStatusEnum.FAILED &&
          event.draftId === "draft-err",
      ),
    ).toBe(true);
  });

  it("processDraftConversion emits JobCreated only when match analysis rows fail to migrate", async () => {
    vi.mocked(matchAnalysisRepo.update).mockReset();
    vi.mocked(matchAnalysisRepo.update).mockResolvedValue({
      affected: 0,
    } as UpdateResult);

    const app = makeJob({ id: "draft-2" });
    const idleDraft = {
      id: "draft-2",
      jobId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const processingDraft = {
      ...idleDraft,
      conversionMetadata: {
        status: DraftJobConversionStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
    };
    vi.mocked(draftJobsService.findOne)
      .mockResolvedValueOnce(idleDraft as never)
      .mockResolvedValueOnce(processingDraft as never)
      .mockResolvedValue(processingDraft as never);
    vi.mocked(draftJobsService.updateConversionMetadata).mockResolvedValue(
      true,
    );
    vi.mocked(draftExtractionService.extract).mockResolvedValue({
      title: "Senior Engineer",
      company: "Acme",
      url: "https://jobs.example.com/x",
      description: "Job description",
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(
      draftExtractionNormalizationService.normalizeExtraction,
    ).mockReturnValue({
      title: "Senior Engineer",
      company: "Acme",
      description: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      false,
    );
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent)
      .mockResolvedValueOnce(
        makeEvent({
          toStage: ApplicationStageEnum.NEW,
          source: StageEventSourceEnum.System,
        }),
      )
      .mockResolvedValueOnce(
        makeEvent({
          fromStage: ApplicationStageEnum.NEW,
          toStage: ApplicationStageEnum.APPLIED,
          source: StageEventSourceEnum.System,
        }),
      );
    vi.mocked(repo.findLatestStageEventByJobIdAndUserId).mockResolvedValue(
      makeEvent({
        toStage: ApplicationStageEnum.NEW,
        source: StageEventSourceEnum.System,
      }),
    );

    await service.createJobWithAI("user-1", "draft-2");
    await service.processDraftConversion("user-1", "draft-2");

    expect(matchAnalysisRepo.update).toHaveBeenCalled();

    expect(repo.setPersistedStage).toHaveBeenCalledWith(
      "user-1",
      "draft-2",
      ApplicationStageEnum.NEW,
    );

    expect(
      jobEventBusEmit.mock.calls.some(
        ([event]) => event instanceof JobCreated && event.jobId === app.id,
      ),
    ).toBe(true);
  });

  it("createJobWithAI does not emit Applied when create detects duplicate", async () => {
    const app = makeJob({ id: "draft-1" });
    const idleDraft = {
      id: "draft-1",
      jobId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const processingDraft = {
      ...idleDraft,
      conversionMetadata: {
        status: DraftJobConversionStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
    };
    vi.mocked(draftJobsService.findOne)
      .mockResolvedValueOnce(idleDraft as never)
      .mockResolvedValueOnce(processingDraft as never)
      .mockResolvedValue(processingDraft as never);
    vi.mocked(draftJobsService.updateConversionMetadata).mockResolvedValue(
      true,
    );
    vi.mocked(draftExtractionService.extract).mockResolvedValue({
      title: "Senior Engineer",
      company: "Acme",
      url: "https://jobs.example.com/x",
      description: "Job description",
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(
      draftExtractionNormalizationService.normalizeExtraction,
    ).mockReturnValue({
      title: "Senior Engineer",
      company: "Acme",
      description: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      true,
    );
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.findLatestStageSummariesByJobIds).mockResolvedValue(
      new Map([
        [
          app.id,
          {
            toStage: ApplicationStageEnum.DUPLICATED,
            reason: null,
            statusAt: new Date(),
          },
        ],
      ]),
    );
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({
        toStage: ApplicationStageEnum.DUPLICATED,
        source: StageEventSourceEnum.System,
      }),
    );

    await service.createJobWithAI("user-1", "draft-1");
    await service.processDraftConversion("user-1", "draft-1");

    expect(draftJobsService.updateConversionMetadata).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      { status: DraftJobConversionStatusEnum.PROCESSING },
      expect.objectContaining({
        status: DraftJobConversionStatusEnum.SUCCEEDED,
      }),
    );

    expect(repo.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ draftJobId: "draft-1" }),
    );

    expect(repo.setPersistedStage).toHaveBeenCalledWith(
      "user-1",
      "draft-1",
      ApplicationStageEnum.DUPLICATED,
    );

    expect(repo.createStageEvent).toHaveBeenCalledTimes(1);
    expect(repo.createStageEvent).toHaveBeenCalledWith(
      "user-1",
      app.id,
      expect.objectContaining({
        fromStage: null,
        toStage: ApplicationStageEnum.DUPLICATED,
        source: StageEventSourceEnum.System,
      }),
    );
  });

  it("update throws for invalid TipTap description JSON", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeJob());

    await expect(
      service.update("app-1", "user-1", { description: "plain text" }),
    ).rejects.toThrow("description must be valid TipTap document JSON");
  });

  it("remove throws NotFoundException when job not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(service.remove("app-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("listStageEvents returns ordered events for owned job", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeJob());
    vi.mocked(repo.findStageEventsByJobIdAndUserId).mockResolvedValue([
      makeEvent(),
    ]);

    const events = await service.listStageEvents("app-1", "user-1");
    expect(events).toHaveLength(1);
    expect(events[0].toStage).toBe(ApplicationStageEnum.NEW);
  });

  it("createStageEvent uses previous stage as fromStage", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeJob());
    vi.mocked(repo.findLatestStageEventByJobIdAndUserId).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.TECHNICAL }),
    );
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({
        fromStage: ApplicationStageEnum.TECHNICAL,
        toStage: ApplicationStageEnum.OFFER,
      }),
    );

    const created = await service.createStageEvent("user-1", {
      jobId: "app-1",
      toStage: ApplicationStageEnum.OFFER,
    });

    expect(created.fromStage).toBe(ApplicationStageEnum.TECHNICAL);
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", "app-1", {
      fromStage: ApplicationStageEnum.TECHNICAL,
      toStage: ApplicationStageEnum.OFFER,
      source: StageEventSourceEnum.Manual,
      reason: null,
      scheduledAt: null,
    });
  });

  it("updateStageEvent updates existing event", async () => {
    vi.mocked(repo.findStageEventByIdAndUserId).mockResolvedValue(makeEvent());
    vi.mocked(repo.updateStageEvent).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.TECHNICAL }),
    );

    const updated = await service.updateStageEvent("event-1", "user-1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      scheduledAt: null,
    });

    expect(updated.toStage).toBe(ApplicationStageEnum.TECHNICAL);
    expect(repo.updateStageEvent).toHaveBeenCalledWith("event-1", "user-1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      reason: undefined,
      scheduledAt: null,
    });
  });

  it("removeStageEvent deletes existing event", async () => {
    vi.mocked(repo.findStageEventByIdAndUserId).mockResolvedValue(makeEvent());
    vi.mocked(repo.deleteStageEvent).mockResolvedValue(true);

    await expect(
      service.removeStageEvent("event-1", "user-1"),
    ).resolves.toBeUndefined();
    expect(repo.deleteStageEvent).toHaveBeenCalledWith("event-1", "user-1");
  });

  it("removeTag removes matching tag and updates job", async () => {
    const app = makeJob({ tags: ["react", "typescript"] });
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.update).mockResolvedValue(makeJob({ tags: ["typescript"] }));

    const result = await service.removeTag("app-1", "user-1", "react");
    expect(result.tags).toEqual(["typescript"]);
    expect(repo.update).toHaveBeenCalledWith("app-1", "user-1", {
      tags: ["typescript"],
    });
  });

  it("removeTag is case-insensitive", async () => {
    const app = makeJob({ tags: ["React"] });
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.update).mockResolvedValue(makeJob({ tags: [] }));

    await service.removeTag("app-1", "user-1", "react");
    expect(repo.update).toHaveBeenCalledWith("app-1", "user-1", { tags: [] });
  });

  it("removeTag throws NotFoundException when update returns null", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(
      makeJob({ tags: ["react"] }),
    );
    vi.mocked(repo.update).mockResolvedValue(null);

    await expect(service.removeTag("app-1", "user-1", "react")).rejects.toThrow(
      NotFoundException,
    );
  });
});
