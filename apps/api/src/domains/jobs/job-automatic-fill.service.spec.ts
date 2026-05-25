import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/jobs/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/jobs/ai/draft-extraction-normalization.service";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { BadRequestException } from "@nestjs/common";
import type { DataSource, EntityManager } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FillJobCompleted,
  FillJobFailed,
  FillJobRequested,
  JobUpdated,
} from "./job.events";
import { JobAutomaticFillService } from "./job-automatic-fill.service";
import { JobEventBus } from "./job-event.bus";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";
import { Job } from "./jobs.schema";
import { JobsService } from "./jobs.service";
import { SalaryService } from "./salary/salary.service";
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

function co(job: Job): NonNullable<Job["company"]> {
  if (!job.company) {
    throw new Error("test fixture expects job.company");
  }
  return job.company;
}

function makeJobWithStage(overrides: Partial<Job> = {}) {
  return {
    ...makeJob(overrides),
    currentStage: ApplicationStageEnum.NEW,
    currentStageReason: null,
    currentStageAt: new Date(),
  };
}

describe("JobAutomaticFillService", () => {
  let service: JobAutomaticFillService;
  let dataSource: Pick<DataSource, "transaction">;
  let repo: JobsRepository;
  let stageEventsRepo: JobStageEventsRepository;
  let jobsService: Pick<JobsService, "findOne">;
  let companyService: CompanyService;
  let salaryService: SalaryService;
  let tagService: TagService;
  let draftExtractionService: DraftExtractionService;
  let draftExtractionNormalizationService: DraftExtractionNormalizationService;
  let jobEventBusEmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dataSource = {
      transaction: vi.fn(async (cb: (manager: EntityManager) => unknown) =>
        cb({} as EntityManager),
      ),
    } as unknown as Pick<DataSource, "transaction">;

    repo = {
      findOneByIdAndUserId: vi.fn(),
      saveJob: vi.fn().mockImplementation(async (job: Job) => job),
      update: vi.fn(),
      setPersistedStage: vi.fn().mockResolvedValue(undefined),
      beginFillAutomaticallyProcessing: vi.fn().mockResolvedValue(true),
      updateFillMetadataIfStatus: vi.fn().mockResolvedValue(true),
    } as unknown as JobsRepository;

    stageEventsRepo = {
      findLatestStageSummariesByJobIds: vi.fn().mockResolvedValue(new Map()),
      createStageEvent: vi.fn().mockResolvedValue(undefined),
    } as unknown as JobStageEventsRepository;

    jobsService = { findOne: vi.fn() };

    companyService = {
      findOne: vi.fn(),
      findOrCreateByName: vi.fn(),
      update: vi.fn(),
    } as unknown as CompanyService;

    salaryService = new SalaryService();
    tagService = new TagService();

    draftExtractionService = {
      extract: vi.fn(),
    } as unknown as DraftExtractionService;

    draftExtractionNormalizationService = {
      normalizeExtraction: vi.fn(),
    } as unknown as DraftExtractionNormalizationService;

    jobEventBusEmit = vi.fn();

    const eventBus = {
      emit: jobEventBusEmit,
      emitJobCreated: vi.fn(),
    } as unknown as JobEventBus;

    service = new JobAutomaticFillService(
      dataSource as DataSource,
      repo,
      stageEventsRepo,
      jobsService as JobsService,
      companyService,
      salaryService,
      tagService,
      draftExtractionService,
      draftExtractionNormalizationService,
      eventBus,
    );
  });

  describe("fillJobAutomatically", () => {
    it("throws BadRequestException when fill metadata is PROCESSING", async () => {
      vi.mocked(jobsService.findOne).mockResolvedValue(
        makeJobWithStage({
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

    it("begins PROCESSING via repository when restartable and emits FillJobRequested", async () => {
      const jobIdle = makeJobWithStage({ fillMetadata: undefined });
      const jobAfterProcessing = makeJobWithStage({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
      });

      vi.mocked(jobsService.findOne)
        .mockResolvedValueOnce(jobIdle)
        .mockResolvedValueOnce(jobAfterProcessing);
      vi.mocked(repo.beginFillAutomaticallyProcessing).mockResolvedValue(true);

      const result = await service.fillJobAutomatically("user-1", "app-1");

      expect(repo.beginFillAutomaticallyProcessing).toHaveBeenCalledWith(
        "app-1",
        "user-1",
      );
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

    it("throws BadRequestException when status update affects zero rows", async () => {
      vi.mocked(jobsService.findOne).mockResolvedValue(
        makeJobWithStage({
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

  describe("processFillJob", () => {
    const tiptapDesc = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Do things" }] },
      ],
    });

    it("calls extract with htmlContent, completes fill metadata, emits FillJobCompleted when not DRAFT", async () => {
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
        salary: {
          minCents: null,
          maxCents: null,
          currency: null,
          period: null,
        } as SalaryEmbedded,
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
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(repo.saveJob).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Role",
          companyId: co(base).id,
          description: tiptapDesc,
          tags: [],
        }),
        expect.anything(),
      );
      expect(repo.update).not.toHaveBeenCalled();
      expect(repo.updateFillMetadataIfStatus).toHaveBeenCalledWith(
        "app-1",
        "user-1",
        AsyncMetadataStatusEnum.PROCESSING,
        expect.objectContaining({ status: AsyncMetadataStatusEnum.COMPLETED }),
        expect.anything(),
      );
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
        salary: {
          minCents: null,
          maxCents: null,
          currency: null,
          period: null,
        } as SalaryEmbedded,
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

    it("promotes DRAFT to NEW inside transaction for DRAFT jobs", async () => {
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
        salary: {
          minCents: null,
          maxCents: null,
          currency: null,
          period: null,
        } as SalaryEmbedded,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));

      await service.processFillJob("user-1", "app-1");

      expect(repo.saveJob).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Role",
          companyId: co(base).id,
          stage: ApplicationStageEnum.NEW,
        }),
        expect.anything(),
      );
      expect(stageEventsRepo.createStageEvent).toHaveBeenCalledWith(
        "user-1",
        "app-1",
        expect.objectContaining({
          fromStage: ApplicationStageEnum.DRAFT,
          toStage: ApplicationStageEnum.NEW,
        }),
        expect.anything(),
      );
      expect(repo.setPersistedStage).not.toHaveBeenCalled();
    });

    it("calls persistFillFailure and emits FillJobFailed when extract fails", async () => {
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
      vi.mocked(repo.updateFillMetadataIfStatus).mockResolvedValue(true);

      await service.processFillJob("user-1", "app-1");

      expect(repo.updateFillMetadataIfStatus).toHaveBeenCalledWith(
        "app-1",
        "user-1",
        AsyncMetadataStatusEnum.PROCESSING,
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
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it("fills FAILED when transactional finalize returns not_found (deleted job)", async () => {
      jobEventBusEmit.mockClear();

      const base = makeJob({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: null,
          timestamp: new Date(),
        },
        htmlContent: "<p>x</p>",
      });
      vi.mocked(repo.findOneByIdAndUserId)
        .mockResolvedValueOnce(base)
        .mockResolvedValueOnce(null);
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
        salary: {
          minCents: null,
          maxCents: null,
          currency: null,
          period: null,
        } as SalaryEmbedded,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));
      vi.mocked(repo.updateFillMetadataIfStatus).mockResolvedValue(true);

      await service.processFillJob("user-1", "app-1");

      expect(repo.updateFillMetadataIfStatus).toHaveBeenCalledWith(
        "app-1",
        "user-1",
        AsyncMetadataStatusEnum.PROCESSING,
        expect.objectContaining({
          status: AsyncMetadataStatusEnum.FAILED,
          error: "Job was deleted.",
        }),
      );
    });

    it("rolls back transactional writes on status mismatch without emitting FillJobFailed", async () => {
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
        salary: {
          minCents: null,
          maxCents: null,
          currency: null,
          period: null,
        } as SalaryEmbedded,
        tags: [],
        location: null,
        workRegion: null,
      });
      vi.mocked(companyService.findOrCreateByName).mockResolvedValue(co(base));
      vi.mocked(repo.updateFillMetadataIfStatus).mockResolvedValue(false);

      await service.processFillJob("user-1", "app-1");

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
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
