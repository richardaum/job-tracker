import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/jobs/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/jobs/ai/draft-extraction-normalization.service";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { LocationInferenceService } from "@api/lib/ai";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FillJobCompleted,
  FillJobFailed,
  FillJobRequested,
  JobUpdated,
} from "./job.events";
import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { JobEventBus } from "./job-event.bus";
import { JobFillPersistence } from "./job-fill.persistence";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobStageEvent } from "./job-stage-events.schema";
import { JobsRepository } from "./jobs.repository";
import { Job } from "./jobs.schema";
import { JobsService } from "./jobs.service";
import { JobsListQuery } from "./jobs-list.query";
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
    salary: null,
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

function co(job: Job): NonNullable<Job["company"]> {
  if (!job.company) {
    throw new Error("test fixture expects job.company");
  }
  return job.company;
}

describe("JobsService", () => {
  let service: JobsService;
  let sourceRunsRepo: Pick<Repository<SourceRunEntity>, "findOne">;
  let repo: JobsRepository;
  let jobsListQuery: JobsListQuery;
  let stageEventsRepo: JobStageEventsRepository;
  let asyncMetadataRepo: JobAsyncMetadataRepository;
  let fillPersistence: JobFillPersistence;
  let companyService: CompanyService;
  let salaryService: SalaryService;
  let tagService: TagService;
  let companyDescriptionService: CompanyDescriptionService;
  let draftExtractionService: DraftExtractionService;
  let draftExtractionNormalizationService: DraftExtractionNormalizationService;
  let locationInferenceService: LocationInferenceService;
  let jobEventBusEmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sourceRunsRepo = { findOne: vi.fn().mockResolvedValue(null) };

    repo = {
      findOneByIdAndUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      setPersistedStage: vi.fn().mockResolvedValue(undefined),
    } as unknown as JobsRepository;

    jobsListQuery = {
      findAllByUserId: vi.fn(),
      hasRecentDuplicateSameRoleAndCompany: vi.fn().mockResolvedValue(false),
      findUpToTwoJobPostingContextsByCompanyName: vi.fn().mockResolvedValue([]),
    } as unknown as JobsListQuery;

    stageEventsRepo = {
      findLatestStageSummariesByJobIds: vi.fn().mockResolvedValue(new Map()),
      findStageEventsByJobIdAndUserId: vi.fn(),
      findLatestStageEventByJobIdAndUserId: vi.fn(),
      findStageEventByIdAndUserId: vi.fn(),
      createStageEvent: vi.fn(),
      updateStageEvent: vi.fn(),
      deleteStageEvent: vi.fn(),
    } as unknown as JobStageEventsRepository;

    asyncMetadataRepo = {
      beginFillAutomaticallyProcessing: vi.fn().mockResolvedValue(true),
      updateCas: vi.fn().mockResolvedValue(true),
    } as unknown as JobAsyncMetadataRepository;

    fillPersistence = {
      finalizeExtractedFill: vi.fn().mockResolvedValue({ ok: true }),
    } as unknown as JobFillPersistence;

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

    jobEventBusEmit = vi.fn();

    const eventBus = {
      emit: jobEventBusEmit,
      emitJobCreated: vi.fn(),
    } as unknown as JobEventBus;

    service = new JobsService(
      sourceRunsRepo as unknown as Repository<SourceRunEntity>,
      repo,
      jobsListQuery,
      stageEventsRepo,
      asyncMetadataRepo,
      fillPersistence,
      companyService,
      salaryService,
      tagService,
      companyDescriptionService,
      draftExtractionService,
      draftExtractionNormalizationService,
      locationInferenceService,
      eventBus,
    );
  });

  it("findAll delegates to repo and attaches current stage", async () => {
    const app = makeJob();
    vi.mocked(jobsListQuery.findAllByUserId).mockResolvedValue([app]);
    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
    expect(jobsListQuery.findAllByUserId).toHaveBeenCalledWith(
      "user-1",
      undefined,
      undefined,
      undefined,
    );
    expect(
      vi.mocked(stageEventsRepo.findLatestStageSummariesByJobIds),
    ).toHaveBeenCalledWith("user-1", [app.id]);
    expect(result[0]?.currentStage).toBe(ApplicationStageEnum.NEW);
  });

  it("findOne returns job when found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeJob());
    const result = await service.findOne("app-1", "user-1");
    expect(result.id).toBe("app-1");
    expect(
      vi.mocked(stageEventsRepo.findLatestStageSummariesByJobIds),
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
        vi.mocked(asyncMetadataRepo.beginFillAutomaticallyProcessing),
      ).not.toHaveBeenCalled();
    });

    it("begins PROCESSING via repository CAS when restartable and emits FillJobRequested", async () => {
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
      vi.mocked(
        asyncMetadataRepo.beginFillAutomaticallyProcessing,
      ).mockResolvedValue(true);

      const result = await service.fillJobAutomatically("user-1", "app-1");

      expect(
        vi.mocked(asyncMetadataRepo.beginFillAutomaticallyProcessing),
      ).toHaveBeenCalledWith("app-1", "user-1");
      expect(jobEventBusEmit).toHaveBeenCalledWith(
        expect.any(FillJobRequested),
      );
      expect(
        jobEventBusEmit.mock.calls.some(
          ([e]) =>
            e instanceof FillJobRequested &&
            e.jobId === "app-1" &&
            e.userId === "user-1",
        ),
      ).toBe(true);
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
      vi.mocked(
        asyncMetadataRepo.beginFillAutomaticallyProcessing,
      ).mockResolvedValue(false);

      await expect(
        service.fillJobAutomatically("user-1", "app-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("processFillJob", () => {
    const tiptapDesc = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Do things" }] },
      ],
    });

    it("calls extract with htmlContent, completes CAS, emits FillJobCompleted when not DRAFT", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: "<html><body>Posting</body></html>",
        urls: [],
        title: null as never,
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);
      vi.mocked(
        stageEventsRepo.findLatestStageSummariesByJobIds,
      ).mockResolvedValue(
        new Map([
          [
            "app-1",
            {
              toStage: ApplicationStageEnum.APPLIED,
              reason: null,
              statusAt: new Date(),
            },
          ],
        ]),
      );
      vi.mocked(draftExtractionService.extract).mockResolvedValue({
        title: "Role",
        company: "Corp",
        url: null,
        description: "plain desc",
        salary: { min: null, max: null, currency: null, period: null },
        tags: [],
        location: null,
        workRegion: null,
      } as never);
      vi.mocked(
        draftExtractionNormalizationService.normalizeExtraction,
      ).mockReturnValue({
        title: "Role",
        company: "Corp",
        description: tiptapDesc,
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));

      await service.processFillJob("user-1", "app-1");

      expect(draftExtractionService.extract).toHaveBeenCalledWith({
        title: "",
        url: null,
        htmlContent: base.htmlContent,
      });
      expect(fillPersistence.finalizeExtractedFill).toHaveBeenCalledWith(
        "app-1",
        "user-1",
        expect.objectContaining({
          title: "Role",
          companyId: co(base).id,
          description: tiptapDesc,
          tags: [],
        }),
        false,
      );
      expect(fillPersistence.finalizeExtractedFill).toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
      expect(asyncMetadataRepo.updateCas).not.toHaveBeenCalled();
      expect(repo.setPersistedStage).not.toHaveBeenCalled();
      expect(
        jobEventBusEmit.mock.calls.some(([e]) => e instanceof FillJobCompleted),
      ).toBe(true);
      expect(
        jobEventBusEmit.mock.calls.some(([e]) => e instanceof JobUpdated),
      ).toBe(true);
    });

    it("falls back to first trimmed URL when htmlContent is empty", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: null,
        urls: ["  https://roles.example/job  "],
        title: "",
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);
      vi.mocked(
        stageEventsRepo.findLatestStageSummariesByJobIds,
      ).mockResolvedValue(
        new Map([
          [
            "app-1",
            {
              toStage: ApplicationStageEnum.NEW,
              reason: null,
              statusAt: new Date(),
            },
          ],
        ]),
      );
      vi.mocked(draftExtractionService.extract).mockResolvedValue({
        title: "Role",
        company: "Corp",
        url: null,
        description: "",
        salary: { min: null, max: null, currency: null, period: null },
        tags: [],
        location: null,
        workRegion: null,
      } as never);
      vi.mocked(
        draftExtractionNormalizationService.normalizeExtraction,
      ).mockReturnValue({
        title: "Role",
        company: "Corp",
        description: null,
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));

      await service.processFillJob("user-1", "app-1");

      expect(draftExtractionService.extract).toHaveBeenCalledWith({
        title: "",
        url: "https://roles.example/job",
        htmlContent: "",
      });
    });

    it("passes promoteDraft=true into transactional finalize for DRAFT jobs", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: "<p>x</p>",
        urls: [],
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);
      vi.mocked(
        stageEventsRepo.findLatestStageSummariesByJobIds,
      ).mockResolvedValue(
        new Map([
          [
            "app-1",
            {
              toStage: ApplicationStageEnum.DRAFT,
              reason: null,
              statusAt: new Date(),
            },
          ],
        ]),
      );
      vi.mocked(draftExtractionService.extract).mockResolvedValue({
        title: "Role",
        company: "Corp",
        url: null,
        description: "",
        salary: { min: null, max: null, currency: null, period: null },
        tags: [],
        location: null,
        workRegion: null,
      } as never);
      vi.mocked(
        draftExtractionNormalizationService.normalizeExtraction,
      ).mockReturnValue({
        title: "Role",
        company: "Corp",
        description: null,
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));

      await service.processFillJob("user-1", "app-1");

      expect(fillPersistence.finalizeExtractedFill).toHaveBeenCalledWith(
        "app-1",
        "user-1",
        expect.objectContaining({ title: "Role", companyId: co(base).id }),
        true,
      );
      expect(repo.setPersistedStage).not.toHaveBeenCalled();
      expect(stageEventsRepo.createStageEvent).not.toHaveBeenCalled();
      expect(fillPersistence.finalizeExtractedFill).toHaveBeenCalled();
    });

    it("calls failFillAutomatically and emits FillJobFailed when extract fails", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: "<p>x</p>",
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);
      vi.mocked(
        stageEventsRepo.findLatestStageSummariesByJobIds,
      ).mockResolvedValue(
        new Map([
          [
            "app-1",
            {
              toStage: ApplicationStageEnum.NEW,
              reason: null,
              statusAt: new Date(),
            },
          ],
        ]),
      );
      vi.mocked(draftExtractionService.extract).mockRejectedValue(
        new Error("extract went wrong"),
      );
      vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);

      await service.processFillJob("user-1", "app-1");

      expect(asyncMetadataRepo.updateCas).toHaveBeenCalledWith(
        "fill",
        "app-1",
        "user-1",
        { status: AsyncMetadataStatusEnum.PROCESSING },
        expect.objectContaining({
          status: AsyncMetadataStatusEnum.FAILED,
          error: "extract went wrong",
        }),
      );
      expect(
        jobEventBusEmit.mock.calls.some(
          ([e]) =>
            e instanceof FillJobFailed &&
            e.error === "extract went wrong" &&
            e.jobId === "app-1",
        ),
      ).toBe(true);
      expect(fillPersistence.finalizeExtractedFill).not.toHaveBeenCalled();
    });

    it("fills FAILED when transactional finalize returns false (deleted job)", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: "<p>x</p>",
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);
      vi.mocked(
        stageEventsRepo.findLatestStageSummariesByJobIds,
      ).mockResolvedValue(
        new Map([
          [
            "app-1",
            {
              toStage: ApplicationStageEnum.NEW,
              reason: null,
              statusAt: new Date(),
            },
          ],
        ]),
      );
      vi.mocked(draftExtractionService.extract).mockResolvedValue({
        title: "Role",
        company: "Corp",
        url: null,
        description: "",
        salary: { min: null, max: null, currency: null, period: null },
        tags: [],
        location: null,
        workRegion: null,
      } as never);
      vi.mocked(
        draftExtractionNormalizationService.normalizeExtraction,
      ).mockReturnValue({
        title: "Role",
        company: "Corp",
        description: null,
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));
      vi.mocked(fillPersistence.finalizeExtractedFill).mockResolvedValue({
        ok: false,
        reason: "not_found",
      });
      vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);

      await service.processFillJob("user-1", "app-1");

      expect(asyncMetadataRepo.updateCas).toHaveBeenCalledWith(
        "fill",
        "app-1",
        "user-1",
        { status: AsyncMetadataStatusEnum.PROCESSING },
        expect.objectContaining({
          status: AsyncMetadataStatusEnum.FAILED,
          error: "Job was deleted.",
        }),
      );
    });

    it("rolls back transactional writes on CAS mismatch without emitting Fill FAILED", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: "<p>x</p>",
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);
      vi.mocked(
        stageEventsRepo.findLatestStageSummariesByJobIds,
      ).mockResolvedValue(
        new Map([
          [
            "app-1",
            {
              toStage: ApplicationStageEnum.NEW,
              reason: null,
              statusAt: new Date(),
            },
          ],
        ]),
      );
      vi.mocked(draftExtractionService.extract).mockResolvedValue({
        title: "Role",
        company: "Corp",
        url: null,
        description: "",
        salary: { min: null, max: null, currency: null, period: null },
        tags: [],
        location: null,
        workRegion: null,
      } as never);
      vi.mocked(
        draftExtractionNormalizationService.normalizeExtraction,
      ).mockReturnValue({
        title: "Role",
        company: "Corp",
        description: null,
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));
      vi.mocked(fillPersistence.finalizeExtractedFill).mockResolvedValue({
        ok: false,
        reason: "cas_mismatch",
      });

      await service.processFillJob("user-1", "app-1");

      expect(asyncMetadataRepo.updateCas).not.toHaveBeenCalled();
      expect(
        jobEventBusEmit.mock.calls.some(([e]) => e instanceof FillJobCompleted),
      ).toBe(false);
      expect(
        jobEventBusEmit.mock.calls.some(([e]) => e instanceof FillJobFailed),
      ).toBe(false);
    });

    it("does nothing when fillMetadata is not PROCESSING", async () => {
      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.COMPLETED,
          error: null,
          timestamp: new Date(),
        },
      });
      vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(base);

      await service.processFillJob("user-1", "app-1");

      expect(draftExtractionService.extract).not.toHaveBeenCalled();
      expect(fillPersistence.finalizeExtractedFill).not.toHaveBeenCalled();
    });
  });

  it("create persists job and emits initial New stage event", async () => {
    const app = makeJob();
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(app));
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(stageEventsRepo.createStageEvent).mockResolvedValue(
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
      vi.mocked(stageEventsRepo.createStageEvent).mock.invocationCallOrder[0]!,
    );
    expect(stageEventsRepo.createStageEvent).toHaveBeenCalledWith(
      "user-1",
      app.id,
      {
        fromStage: null,
        toStage: ApplicationStageEnum.NEW,
        source: StageEventSourceEnum.System,
        reason: null,
        scheduledAt: null,
      },
    );
    expect(
      jobsListQuery.hasRecentDuplicateSameRoleAndCompany,
    ).toHaveBeenCalledWith(
      "user-1",
      app.id,
      co(app).id,
      "Engineer",
      expect.any(Date),
      expect.any(Number),
    );
  });

  it("create uses Duplicated initial stage when matching job exists in lookback window", async () => {
    const app = makeJob();
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(app));
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(
      jobsListQuery.hasRecentDuplicateSameRoleAndCompany,
    ).mockResolvedValue(true);
    vi.mocked(
      stageEventsRepo.findLatestStageSummariesByJobIds,
    ).mockResolvedValue(
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
    vi.mocked(stageEventsRepo.createStageEvent).mockResolvedValue(
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
      vi.mocked(stageEventsRepo.createStageEvent).mock.invocationCallOrder[0]!,
    );
    expect(stageEventsRepo.createStageEvent).toHaveBeenCalledWith(
      "user-1",
      app.id,
      {
        fromStage: null,
        toStage: ApplicationStageEnum.DUPLICATED,
        source: StageEventSourceEnum.System,
        reason: null,
        scheduledAt: null,
      },
    );
  });

  it("draft capture persists without resolved company when none is provided", async () => {
    const saved = makeJob({
      description: null,
      htmlContent: "<p>h</p>",
      companyId: null,
      urls: ["https://example.com/job"],
      source: null,
    });
    (saved as { company?: unknown }).company = undefined;

    vi.mocked(repo.create).mockResolvedValue(saved);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(saved);
    vi.mocked(
      stageEventsRepo.findLatestStageSummariesByJobIds,
    ).mockResolvedValue(
      new Map([
        [
          saved.id,
          {
            toStage: ApplicationStageEnum.DRAFT,
            reason: null,
            statusAt: new Date(),
          },
        ],
      ]),
    );
    vi.mocked(stageEventsRepo.createStageEvent).mockResolvedValue(
      makeEvent({
        toStage: ApplicationStageEnum.DRAFT,
        source: StageEventSourceEnum.System,
      }),
    );

    const result = await service.create("user-1", {
      htmlContent: "<p>h</p>",
      urls: ["https://example.com/job"],
      createAsDraftCapture: true,
    });

    expect(companyService.findOrCreateByName).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ companyId: null }),
    );
    expect(
      jobsListQuery.hasRecentDuplicateSameRoleAndCompany,
    ).not.toHaveBeenCalled();
    expect(result.currentStage).toBe(ApplicationStageEnum.DRAFT);
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
      jobsListQuery.findUpToTwoJobPostingContextsByCompanyName,
    ).mockResolvedValue(snippets);
    vi.mocked(
      companyDescriptionService.generateCompanyDescription,
    ).mockResolvedValue("{}");

    await service.generateCompanyDescription("user-1", {
      companyName: "  Acme  ",
    });

    expect(
      jobsListQuery.findUpToTwoJobPostingContextsByCompanyName,
    ).toHaveBeenCalledWith("user-1", "  Acme  ");
    expect(
      vi.mocked(companyDescriptionService.generateCompanyDescription),
    ).toHaveBeenCalledWith({
      companyName: "  Acme  ",
      jobPostingContexts: snippets,
    });
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
    vi.mocked(
      stageEventsRepo.findStageEventsByJobIdAndUserId,
    ).mockResolvedValue([makeEvent()]);

    const events = await service.listStageEvents("app-1", "user-1");
    expect(events).toHaveLength(1);
    expect(events[0].toStage).toBe(ApplicationStageEnum.NEW);
  });

  it("createStageEvent uses previous stage as fromStage", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeJob());
    vi.mocked(
      stageEventsRepo.findLatestStageEventByJobIdAndUserId,
    ).mockResolvedValue(makeEvent({ toStage: ApplicationStageEnum.TECHNICAL }));
    vi.mocked(stageEventsRepo.createStageEvent).mockResolvedValue(
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
    expect(stageEventsRepo.createStageEvent).toHaveBeenCalledWith(
      "user-1",
      "app-1",
      {
        fromStage: ApplicationStageEnum.TECHNICAL,
        toStage: ApplicationStageEnum.OFFER,
        source: StageEventSourceEnum.Manual,
        reason: null,
        scheduledAt: null,
      },
    );
  });

  it("updateStageEvent updates existing event", async () => {
    vi.mocked(stageEventsRepo.findStageEventByIdAndUserId).mockResolvedValue(
      makeEvent(),
    );
    vi.mocked(stageEventsRepo.updateStageEvent).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.TECHNICAL }),
    );

    const updated = await service.updateStageEvent("event-1", "user-1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      scheduledAt: null,
    });

    expect(updated.toStage).toBe(ApplicationStageEnum.TECHNICAL);
    expect(stageEventsRepo.updateStageEvent).toHaveBeenCalledWith(
      "event-1",
      "user-1",
      {
        toStage: ApplicationStageEnum.TECHNICAL,
        reason: undefined,
        scheduledAt: null,
      },
    );
  });

  it("removeStageEvent deletes existing event", async () => {
    vi.mocked(stageEventsRepo.findStageEventByIdAndUserId).mockResolvedValue(
      makeEvent(),
    );
    vi.mocked(stageEventsRepo.deleteStageEvent).mockResolvedValue(true);

    await expect(
      service.removeStageEvent("event-1", "user-1"),
    ).resolves.toBeUndefined();
    expect(stageEventsRepo.deleteStageEvent).toHaveBeenCalledWith(
      "event-1",
      "user-1",
    );
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
