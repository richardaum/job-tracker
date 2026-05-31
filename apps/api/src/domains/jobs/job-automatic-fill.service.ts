import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/jobs/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/jobs/ai/draft-extraction-normalization.service";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, forwardRef, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import type { DataSource } from "typeorm";

import { FillJobStatusChanged, JobUpdated } from "./job.events";
import { JobEventBus } from "./job-event.bus";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository, UpdateJobRepoDto } from "./jobs.repository";
import { JobsService } from "./jobs.service";
import { SalaryService } from "./salary/salary.service";
import { StageEventSourceEnum } from "./stage-event-source.enum";
import { TagService } from "./tags/tag.service";

class FillCompletionStatusMismatchError extends Error {
  constructor() {
    super("Automatic fill finalize missed PROCESSING precondition.");
    this.name = "FillCompletionStatusMismatchError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type FinalizeExtractedFillResult = { ok: true } | { ok: false; reason: "not_found" | "status_mismatch" };

@Injectable()
export class JobAutomaticFillService implements OnModuleInit {
  private readonly logger = new Logger(JobAutomaticFillService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly repo: JobsRepository,
    private readonly stageEventsRepo: JobStageEventsRepository,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
    private readonly companyService: CompanyService,
    private readonly salaryService: SalaryService,
    private readonly tagService: TagService,
    private readonly draftExtractionService: DraftExtractionService,
    private readonly draftExtractionNormalizationService: DraftExtractionNormalizationService,
    private readonly eventBus: JobEventBus,
  ) {}

  onModuleInit(): void {
    void this.resetStaleProcessing();
  }

  private async resetStaleProcessing(): Promise<void> {
    const count = await this.repo.resetStaleFillProcessing();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale PROCESSING fill jobs`);
    }
  }

  /**
   * Starts async fill: transitions to {@link AsyncMetadataStatusEnum.Processing}, emits
   * {@link FillJobStatusChanged} on {@link JobEventBus}, returns immediately.
   */
  async fillJobAutomatically(userId: string, jobId: string) {
    const existing = await this.jobsService.findOne(jobId, userId);

    if (existing.fillMetadata?.status === AsyncMetadataStatusEnum.Processing) {
      throw new BadRequestException("Fill already in progress");
    }

    const started = await this.repo.beginFillAutomaticallyProcessing(jobId, userId);
    if (!started) {
      throw new BadRequestException("Could not start fill — the job fill state changed. Try again.");
    }

    this.eventBus.emit(new FillJobStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Processing));

    return this.jobsService.findOne(jobId, userId);
  }

  /**
   * Background worker: extracts from `htmlContent` (preferred) with URL fallback via
   * {@link DraftExtractionService}, normalizes fields, updates the job row in place, then
   * completes or fails `fillMetadata` when still {@link AsyncMetadataStatusEnum.Processing}.
   */
  async processFillJob(userId: string, jobId: string): Promise<void> {
    const row = await this.repo.findOneByIdAndUserId(jobId, userId);
    if (!row) {
      const ok = await this.repo.updateFillMetadataIfStatus(jobId, userId, AsyncMetadataStatusEnum.Processing, {
        status: AsyncMetadataStatusEnum.Failed,
        error: "Job not found.",
        timestamp: new Date(),
      });
      if (ok) {
        this.eventBus.emit(new FillJobStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Failed, "Job not found."));
      }
      return;
    }

    if (row.fillMetadata?.status !== AsyncMetadataStatusEnum.Processing) {
      return;
    }

    const stageSummary = await this.stageEventsRepo.findLatestStageSummariesByJobIds(userId, [jobId]);
    const currentStage = stageSummary.get(jobId)?.toStage;
    const shouldPromoteDraftToNew = currentStage === ApplicationStageEnum.Draft;

    const [extractError, raw] = await tryRun(
      this.draftExtractionService.extract({
        title: row.title?.trim() ?? "",
        url: typeof row.urls?.[0] === "string" && row.urls[0].trim() ? row.urls[0].trim() : null,
        htmlContent: row.htmlContent?.trim() ?? "",
      }),
    );

    if (extractError != null) {
      await this.persistFillFailure(
        jobId,
        userId,
        extractError instanceof Error ? extractError.message : "Unknown error",
      );
      return;
    }

    const normalized = this.draftExtractionNormalizationService.normalizeExtraction(raw as Record<string, unknown>);

    const [salaryErr, salaryEmbedded] = await tryRun(() => this.salaryService.getUpdateSalary(row, normalized.salary));

    if (salaryErr != null) {
      await this.persistFillFailure(
        jobId,
        userId,
        salaryErr instanceof Error ? salaryErr.message : "Salary validation failed.",
      );
      return;
    }

    const companyId = await this.resolveCompanyId(userId, normalized.company, undefined);

    if (!companyId) {
      await this.persistFillFailure(jobId, userId, "Company could not be resolved");
      return;
    }

    const repoDto: UpdateJobRepoDto = {
      title: normalized.title,
      companyId,
      description: normalized.description,
      tags: this.tagService.normalizeTags(normalized.tags),
      location: normalized.location ?? null,
      workRegion: normalized.workRegion ?? null,
      ...(salaryEmbedded != null ? { salary: salaryEmbedded } : {}),
    };

    const [txnErr, result] = await tryRun(this.finalizeExtractedFill(jobId, userId, repoDto, shouldPromoteDraftToNew));

    if (txnErr != null) {
      await this.persistFillFailure(
        jobId,
        userId,
        txnErr instanceof Error ? txnErr.message : "Fill persistence failed.",
      );
      return;
    }

    if (!result.ok && result.reason === "status_mismatch") {
      this.logger.warn(`[${jobId}] Fill finalize missed PROCESSING inside TX — rolled back extraction/promotion.`);
      return;
    }

    if (!result.ok) {
      await this.persistFillFailure(jobId, userId, "Job was deleted.");
      return;
    }

    this.eventBus.emit(new FillJobStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Completed));
    this.eventBus.emit(new JobUpdated(jobId, userId));
  }

  /**
   * Atomically persists AI extraction, optionally promotes DRAFT → NEW with a stage event,
   * then completes fill metadata. Rolls back all writes on status mismatch.
   */
  private async finalizeExtractedFill(
    jobId: string,
    userId: string,
    dto: UpdateJobRepoDto,
    shouldPromoteDraftToNew: boolean,
  ): Promise<FinalizeExtractedFillResult> {
    const [err, result] = await tryRun(
      this.dataSource.transaction(async (manager) => {
        const existing = await this.repo.findOneByIdAndUserId(jobId, userId, manager);
        if (!existing) {
          return { ok: false as const, reason: "not_found" as const };
        }

        Object.assign(existing, dto);
        if (shouldPromoteDraftToNew) {
          existing.stage = ApplicationStageEnum.New;
        }
        await this.repo.saveJob(existing, manager);

        if (shouldPromoteDraftToNew) {
          await this.stageEventsRepo.createStageEvent(
            userId,
            jobId,
            {
              fromStage: ApplicationStageEnum.Draft,
              toStage: ApplicationStageEnum.New,
              source: StageEventSourceEnum.System,
            },
            manager,
          );
        }

        const completed = await this.repo.updateFillMetadataIfStatus(
          jobId,
          userId,
          AsyncMetadataStatusEnum.Processing,
          { status: AsyncMetadataStatusEnum.Completed, timestamp: new Date(), error: null },
          manager,
        );
        if (!completed) {
          throw new FillCompletionStatusMismatchError();
        }

        return { ok: true as const };
      }),
    );

    if (err instanceof FillCompletionStatusMismatchError) {
      return { ok: false, reason: "status_mismatch" };
    }
    if (err != null) {
      throw err;
    }

    return result;
  }

  private async persistFillFailure(jobId: string, userId: string, message: string): Promise<void> {
    const ok = await this.repo.updateFillMetadataIfStatus(jobId, userId, AsyncMetadataStatusEnum.Processing, {
      status: AsyncMetadataStatusEnum.Failed,
      error: message,
      timestamp: new Date(),
    });
    if (!ok) {
      this.logger.warn(`[${jobId}] Could not persist fill failure (${message}) — status mismatch or stale.`);
      return;
    }
    this.eventBus.emit(new FillJobStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Failed, message));
  }

  private async resolveCompanyId(
    userId: string,
    companyName?: string | null,
    companyId?: string | null,
  ): Promise<string | undefined> {
    const cid = typeof companyId === "string" ? companyId.trim() : "";
    if (cid) {
      const company = await this.companyService.findOne(cid, userId);
      return company.id;
    }
    const name = typeof companyName === "string" ? companyName.trim() : "";
    if (name) {
      const company = await this.companyService.findOrCreateByName(userId, name);
      return company.id;
    }
    return undefined;
  }
}
