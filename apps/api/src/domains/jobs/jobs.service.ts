import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/jobs/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/jobs/ai/draft-extraction-normalization.service";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { LocationInferenceService } from "@api/lib/ai";
import { sanitizeCapturedHtml } from "@job-tracker/html-sanitize";
import { isTipTapDocumentString, tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";

import {
  FillJobCompleted,
  FillJobFailed,
  FillJobRequested,
  JobCreated,
  JobUpdated,
} from "./job.events";
import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { APPLICATION_DUPLICATE_PAIRING_WINDOW_MS } from "./job-duplicate.constants";
import { JobEventBus } from "./job-event.bus";
import { JobFillPersistence } from "./job-fill.persistence";
import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationSourceEnum } from "./job-source.enum";
import { inferJobSourceEnumFromUrls } from "./job-source.util";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobStageEvent } from "./job-stage-events.schema";
import {
  CreateJobRepoDto,
  JobsRepository,
  UpdateJobRepoDto,
} from "./jobs.repository";
import { Job } from "./jobs.schema";
import { JobsListQuery } from "./jobs-list.query";
import { SalaryService } from "./salary/salary.service";
import { SalaryPeriodEnum } from "./salary/salary-period.enum";
import { StageEventSourceEnum } from "./stage-event-source.enum";
import { TagService } from "./tags/tag.service";

type CreateDto = {
  title?: string | null;
  company?: string | null;
  companyId?: string | null;
  description?: string | null;
  urls?: string[] | null;
  source?: ApplicationSourceEnum | null;
  salary?: {
    minCents?: number | null;
    maxCents?: number | null;
    currency?: string | null;
    period?: SalaryPeriodEnum | null;
  };
  tags?: string[] | null;
  location?: string | null;
  workRegion?: string | null;
  htmlContent?: string | null;
  draftJobId?: string | null;
  sourceRunId?: string | null;
  createAsDraftCapture?: boolean | null;
};
type UpdateDto = Partial<CreateDto>;
type CreateStageEventDto = {
  jobId: string;
  toStage: ApplicationStageEnum;
  source?: StageEventSourceEnum;
  reason?: string | null;
  scheduledAt?: Date;
};
type UpdateStageEventDto = {
  toStage?: ApplicationStageEnum;
  reason?: string | null;
  scheduledAt?: Date | null;
};
type GenerateCompanyDescriptionDto = { companyName: string };

type JobWithCurrentStage = Job & {
  currentStage: ApplicationStageEnum;
  currentStageReason: string | null;
  currentStageAt: Date;
};

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(SourceRunEntity)
    private readonly sourceRunsRepo: Repository<SourceRunEntity>,
    private readonly repo: JobsRepository,
    private readonly jobsListQuery: JobsListQuery,
    private readonly stageEventsRepo: JobStageEventsRepository,
    private readonly asyncMetadataRepo: JobAsyncMetadataRepository,
    private readonly fillPersistence: JobFillPersistence,
    private readonly companyService: CompanyService,
    private readonly salaryService: SalaryService,
    private readonly tagService: TagService,
    private readonly companyDescriptionService: CompanyDescriptionService,
    private readonly draftExtractionService: DraftExtractionService,
    private readonly draftExtractionNormalizationService: DraftExtractionNormalizationService,
    private readonly locationInferenceService: LocationInferenceService,
    private readonly eventBus: JobEventBus,
  ) {}

  async findAll(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
    company?: string,
    runId?: string,
  ): Promise<JobWithCurrentStage[]> {
    const apps = await this.jobsListQuery.findAllByUserId(
      userId,
      filter,
      company,
      runId,
    );
    return this.attachCurrentStage(
      userId,
      apps.map((app) => ({ ...app, urls: app.urls ?? [] })),
    );
  }

  async findOne(id: string, userId: string): Promise<JobWithCurrentStage> {
    const app = await this.repo.findOneByIdAndUserId(id, userId);
    if (!app) throw new NotFoundException(`Job ${id} not found`);
    return (
      await this.attachCurrentStage(userId, [{ ...app, urls: app.urls ?? [] }])
    )[0]!;
  }

  private normalizeHtmlContent(
    htmlContent: string | null | undefined,
  ): string | null | undefined {
    if (htmlContent === undefined) {
      return undefined;
    }
    if (htmlContent === null) {
      return null;
    }
    return sanitizeCapturedHtml(htmlContent);
  }

  private normalizeUrls(urls: string[] | null | undefined): string[] {
    if (!urls) {
      return [];
    }
    const deduped = new Set<string>();
    for (const url of urls) {
      const trimmed = url.trim();
      if (!trimmed) {
        continue;
      }
      deduped.add(trimmed);
    }
    return Array.from(deduped);
  }

  private async attachCurrentStage(
    userId: string,
    apps: Job[],
  ): Promise<JobWithCurrentStage[]> {
    if (apps.length === 0) {
      return [];
    }
    const byId = await this.stageEventsRepo.findLatestStageSummariesByJobIds(
      userId,
      apps.map((a) => a.id),
    );
    return apps.map((app) => {
      const s = byId.get(app.id);
      return {
        ...app,
        currentStage: (s?.toStage ??
          ApplicationStageEnum.NEW) as ApplicationStageEnum,
        currentStageReason: s?.reason ?? null,
        currentStageAt: s?.statusAt ?? app.createdAt,
      };
    });
  }

  /** Promote DRAFT captures to NEW once automatic fill succeeds (canonical stage from events). */
  private shouldPromoteDraftToNewAfterFill(
    currentStage: ApplicationStageEnum | undefined,
  ): boolean {
    return currentStage === ApplicationStageEnum.DRAFT;
  }

  async create(userId: string, dto: CreateDto): Promise<JobWithCurrentStage> {
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isTipTapDocumentString(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }

    if (dto.createAsDraftCapture) {
      if (
        dto.description !== undefined &&
        dto.description !== null &&
        dto.description.trim() !== ""
      ) {
        throw new BadRequestException(
          "Draft capture jobs cannot carry a TipTap description; use htmlContent.",
        );
      }
      const htmlTrim = dto.htmlContent?.trim() ?? "";
      if (!htmlTrim) {
        throw new BadRequestException(
          "Draft capture jobs require htmlContent.",
        );
      }

      const companyId = await this.resolveCompanyId(
        userId,
        dto.company,
        dto.companyId,
      );

      const tags = this.tagService.normalizeTags(dto.tags);
      const normalizedUrls = this.normalizeUrls(dto.urls);
      const salaryColumns = this.salaryService.getCreateSalary(dto);
      const repoDto: CreateJobRepoDto = {
        title: dto.title ?? null,
        companyId: companyId ?? null,
        description: null,
        urls: normalizedUrls,
        htmlContent: this.normalizeHtmlContent(dto.htmlContent) ?? null,
        source:
          dto.source !== undefined
            ? dto.source
            : inferJobSourceEnumFromUrls(normalizedUrls),
        tags,
        location: dto.location ?? null,
        workRegion: dto.workRegion ?? null,
        draftJobId: null,
        sourceRunId: dto.sourceRunId ?? null,
        ...salaryColumns,
      };

      const job = await this.repo.create(userId, repoDto);

      await this.repo.setPersistedStage(
        userId,
        job.id,
        ApplicationStageEnum.DRAFT,
      );

      await this.stageEventsRepo.createStageEvent(userId, job.id, {
        fromStage: null,
        toStage: ApplicationStageEnum.DRAFT,
        source: StageEventSourceEnum.System,
        reason: null,
        scheduledAt: null,
      });

      return this.findOne(job.id, userId);
    }

    if (dto.sourceRunId) {
      const run = await this.sourceRunsRepo.findOne({
        where: { id: dto.sourceRunId, userId },
      });
      if (!run) {
        throw new BadRequestException(
          `Source run ${dto.sourceRunId} not found`,
        );
      }
    }

    const companyId = await this.resolveCompanyId(
      userId,
      dto.company,
      dto.companyId,
    );

    if (!companyId) {
      throw new BadRequestException("Company could not be resolved");
    }
    const salaryEmbedded = this.salaryService.getCreateSalary(dto.salary ?? {});
    const tags = this.tagService.normalizeTags(dto.tags);
    const normalizedUrls = this.normalizeUrls(dto.urls);

    const repoDto: CreateJobRepoDto = {
      title: dto.title ?? null,
      companyId,
      description: dto.description ?? null,
      urls: normalizedUrls,
      htmlContent: this.normalizeHtmlContent(dto.htmlContent) ?? null,
      source:
        dto.source !== undefined
          ? dto.source
          : inferJobSourceEnumFromUrls(normalizedUrls),
      tags,
      location: dto.location ?? null,
      workRegion: dto.workRegion ?? null,
      draftJobId: dto.draftJobId ?? null,
      sourceRunId: dto.sourceRunId ?? null,
      salary: salaryEmbedded,
    };

    const job = await this.repo.create(userId, repoDto);

    const duplicateLookbackMs = APPLICATION_DUPLICATE_PAIRING_WINDOW_MS;
    const referenceTime = new Date();
    const isDuplicate =
      await this.jobsListQuery.hasRecentDuplicateSameRoleAndCompany(
        userId,
        job.id,
        companyId,
        dto.title ?? "",
        referenceTime,
        duplicateLookbackMs,
      );

    const initialStage = isDuplicate
      ? ApplicationStageEnum.DUPLICATED
      : ApplicationStageEnum.NEW;

    await this.repo.setPersistedStage(userId, job.id, initialStage);

    await this.stageEventsRepo.createStageEvent(userId, job.id, {
      fromStage: null,
      toStage: initialStage,
      source: StageEventSourceEnum.System,
      reason: null,
      scheduledAt: null,
    });
    const hydrated = await this.findOne(job.id, userId);

    if (dto.sourceRunId) {
      this.eventBus.emit(new JobCreated(job.id, userId));
    }

    return hydrated;
  }

  /**
   * Starts async fill: CAS to {@link AsyncMetadataStatusEnum.PROCESSING}, emits
   * {@link FillJobRequested} on {@link JobEventBus}, returns immediately.
   */
  async fillJobAutomatically(
    userId: string,
    jobId: string,
  ): Promise<JobWithCurrentStage> {
    const existing = await this.findOne(jobId, userId);

    if (existing.fillMetadata?.status === AsyncMetadataStatusEnum.PROCESSING) {
      throw new BadRequestException("Fill already in progress");
    }

    const started =
      await this.asyncMetadataRepo.beginFillAutomaticallyProcessing(
        jobId,
        userId,
      );
    if (!started) {
      throw new BadRequestException(
        "Could not start fill — the job fill state changed. Try again.",
      );
    }

    this.eventBus.emit(new FillJobRequested(jobId, userId));

    return this.findOne(jobId, userId);
  }

  /**
   * Background worker: extracts from `htmlContent` (preferred) with URL fallback via
   * {@link DraftExtractionService}, normalizes fields, updates the job row in place, then CAS-completes or
   * fails `fillMetadata` when still {@link AsyncMetadataStatusEnum.PROCESSING}.
   */
  async processFillJob(userId: string, jobId: string): Promise<void> {
    const row = await this.repo.findOneByIdAndUserId(jobId, userId);
    if (!row) {
      const ok = await this.asyncMetadataRepo.updateCas(
        "fill",
        jobId,
        userId,
        { status: AsyncMetadataStatusEnum.PROCESSING },
        {
          status: AsyncMetadataStatusEnum.FAILED,
          error: "Job not found.",
          timestamp: new Date(),
        },
      );
      if (ok) {
        this.eventBus.emit(new FillJobFailed(jobId, userId, "Job not found."));
      }
      return;
    }

    if (row.fillMetadata?.status !== AsyncMetadataStatusEnum.PROCESSING) {
      return;
    }

    const jobWithStage =
      (
        await this.attachCurrentStage(userId, [
          { ...row, urls: row.urls ?? [] },
        ])
      )[0] ?? null;
    const shouldPromoteDraftToNew = this.shouldPromoteDraftToNewAfterFill(
      jobWithStage?.currentStage,
    );

    const [extractError, raw] = await tryRun(
      this.draftExtractionService.extract({
        title: row.title?.trim() ?? "",
        url:
          typeof row.urls?.[0] === "string" && row.urls[0].trim()
            ? row.urls[0].trim()
            : null,
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

    const normalized =
      this.draftExtractionNormalizationService.normalizeExtraction(
        raw as Record<string, unknown>,
      );

    const [salaryErr, salaryEmbedded] = await tryRun(() =>
      this.salaryService.getUpdateSalary(row, normalized.salary),
    );

    if (salaryErr != null) {
      await this.persistFillFailure(
        jobId,
        userId,
        salaryErr instanceof Error
          ? salaryErr.message
          : "Salary validation failed.",
      );
      return;
    }

    const companyId = await this.resolveCompanyId(
      userId,
      normalized.company,
      undefined,
    );

    if (!companyId) {
      await this.persistFillFailure(
        jobId,
        userId,
        "Company could not be resolved",
      );
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

    const [txnErr, result] = await tryRun(
      this.fillPersistence.finalizeExtractedFill(
        jobId,
        userId,
        repoDto,
        shouldPromoteDraftToNew,
      ),
    );

    if (txnErr != null) {
      await this.persistFillFailure(
        jobId,
        userId,
        txnErr instanceof Error ? txnErr.message : "Fill persistence failed.",
      );
      return;
    }

    if (!result.ok && result.reason === "cas_mismatch") {
      this.logger.warn(
        `[${jobId}] Fill finalize CAS missed PROCESSING inside TX — rolled back extraction/promotion.`,
      );
      return;
    }

    if (!result.ok) {
      await this.persistFillFailure(jobId, userId, "Job was deleted.");
      return;
    }

    this.eventBus.emit(new FillJobCompleted(jobId, userId));
    this.eventBus.emit(new JobUpdated(jobId, userId));
  }

  private async persistFillFailure(
    jobId: string,
    userId: string,
    message: string,
  ): Promise<void> {
    const ok = await this.asyncMetadataRepo.updateCas(
      "fill",
      jobId,
      userId,
      { status: AsyncMetadataStatusEnum.PROCESSING },
      {
        status: AsyncMetadataStatusEnum.FAILED,
        error: message,
        timestamp: new Date(),
      },
    );
    if (!ok) {
      this.logger.warn(
        `[${jobId}] Could not persist fill failure (${message}) — CAS missed or stale.`,
      );
      return;
    }
    this.eventBus.emit(new FillJobFailed(jobId, userId, message));
  }

  async inferJobLocation(
    userId: string,
    jobId: string,
  ): Promise<string | null> {
    const app = await this.findOne(jobId, userId);
    const plainText = tipTapToPlainText(app.description);
    return this.locationInferenceService.inferLocation(plainText);
  }

  async inferJobWorkRegion(
    userId: string,
    jobId: string,
  ): Promise<string | null> {
    const app = await this.findOne(jobId, userId);
    const plainText = tipTapToPlainText(app.description);
    return this.locationInferenceService.inferWorkRegion(plainText);
  }

  async generateCompanyDescription(
    userId: string,
    dto: GenerateCompanyDescriptionDto,
  ) {
    const jobPostingContexts =
      await this.jobsListQuery.findUpToTwoJobPostingContextsByCompanyName(
        userId,
        dto.companyName,
      );

    return this.companyDescriptionService.generateCompanyDescription({
      companyName: dto.companyName,
      jobPostingContexts,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<JobWithCurrentStage> {
    const existing = await this.findOne(id, userId);
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isTipTapDocumentString(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }

    const companyId = await this.resolveCompanyId(
      userId,
      dto.company,
      dto.companyId,
    );
    const salaryEmbedded =
      dto.salary != null
        ? this.salaryService.getUpdateSalary(existing, dto.salary)
        : undefined;
    const tags =
      dto.tags !== undefined
        ? this.tagService.normalizeTags(dto.tags)
        : undefined;
    const normalizedUrls =
      dto.urls !== undefined ? this.normalizeUrls(dto.urls) : undefined;

    const repoDto: UpdateJobRepoDto = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(companyId !== undefined ? { companyId } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(normalizedUrls !== undefined ? { urls: normalizedUrls } : {}),
      ...(dto.source !== undefined
        ? { source: dto.source }
        : normalizedUrls !== undefined
          ? { source: inferJobSourceEnumFromUrls(normalizedUrls) }
          : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(dto.location !== undefined ? { location: dto.location } : {}),
      ...(dto.workRegion !== undefined ? { workRegion: dto.workRegion } : {}),
      ...(salaryEmbedded !== null && salaryEmbedded !== undefined
        ? { salary: salaryEmbedded }
        : {}),
      ...(dto.htmlContent !== undefined
        ? { htmlContent: this.normalizeHtmlContent(dto.htmlContent) ?? null }
        : {}),
    };

    const updated = await this.repo.update(id, userId, repoDto);

    if (!updated) throw new NotFoundException(`Job ${id} not found`);

    this.eventBus.emit(new JobUpdated(id, userId));

    return (await this.attachCurrentStage(userId, [updated]))[0]!;
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
      const company = await this.companyService.findOrCreateByName(
        userId,
        name,
      );
      return company.id;
    }
    return undefined;
  }

  async remove(id: string, userId: string): Promise<JobWithCurrentStage> {
    await this.findOne(id, userId);
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new NotFoundException(`Job ${id} not found`);
    return (await this.attachCurrentStage(userId, [deleted]))[0]!;
  }

  async listStageEvents(
    jobId: string,
    userId: string,
  ): Promise<JobStageEvent[]> {
    await this.findOne(jobId, userId);
    return this.stageEventsRepo.findStageEventsByJobIdAndUserId(jobId, userId);
  }

  async createStageEvent(
    userId: string,
    dto: CreateStageEventDto,
  ): Promise<JobStageEvent> {
    await this.findOne(dto.jobId, userId);
    const latest =
      await this.stageEventsRepo.findLatestStageEventByJobIdAndUserId(
        dto.jobId,
        userId,
      );
    const event = await this.stageEventsRepo.createStageEvent(
      userId,
      dto.jobId,
      {
        fromStage: latest?.toStage ?? null,
        toStage: dto.toStage,
        source: dto.source ?? StageEventSourceEnum.Manual,
        reason: dto.reason ?? null,
        scheduledAt: dto.scheduledAt ?? null,
      },
    );

    this.eventBus.emit(new JobUpdated(dto.jobId, userId));
    return event;
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: UpdateStageEventDto,
  ): Promise<JobStageEvent> {
    const stageEvent = await this.stageEventsRepo.findStageEventByIdAndUserId(
      stageEventId,
      userId,
    );
    if (!stageEvent) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    const updated = await this.stageEventsRepo.updateStageEvent(
      stageEventId,
      userId,
      {
        toStage: dto.toStage,
        reason: dto.reason,
        scheduledAt: dto.scheduledAt,
      },
    );
    if (!updated) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    this.eventBus.emit(new JobUpdated(stageEvent.jobId, userId));
    return updated;
  }

  async removeStageEvent(stageEventId: string, userId: string): Promise<void> {
    const stageEvent = await this.stageEventsRepo.findStageEventByIdAndUserId(
      stageEventId,
      userId,
    );
    if (!stageEvent) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    const deleted = await this.stageEventsRepo.deleteStageEvent(
      stageEventId,
      userId,
    );
    if (!deleted) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    this.eventBus.emit(new JobUpdated(stageEvent.jobId, userId));
  }

  async removeTag(
    id: string,
    userId: string,
    tag: string,
  ): Promise<JobWithCurrentStage> {
    const existing = await this.findOne(id, userId);
    const tags = (existing.tags ?? []).filter(
      (t) => t.toLowerCase() !== tag.toLowerCase(),
    );
    const updated = await this.repo.update(id, userId, { tags });
    if (!updated) throw new NotFoundException(`Job ${id} not found`);
    return (await this.attachCurrentStage(userId, [updated]))[0]!;
  }
}
