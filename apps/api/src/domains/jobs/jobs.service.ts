import { DraftJobConversionStatusEnum } from "@api/database/entities/draft-job.entity";
import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/draft-jobs/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/draft-jobs/ai/draft-extraction-normalization.service";
import {
  DraftConversionRequested,
  DraftConversionStatusChanged,
} from "@api/domains/draft-jobs/draft-job.events";
import { DraftJobType } from "@api/domains/draft-jobs/draft-job.type";
import { DraftJobEventBus } from "@api/domains/draft-jobs/draft-job-event.bus";
import { DraftJobsService } from "@api/domains/draft-jobs/draft-jobs.service";
import { LocationInferenceService } from "@api/lib/ai";
import { isTipTapDocumentString, tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { JobCreated, JobUpdated } from "./job.events";
import { APPLICATION_DUPLICATE_PAIRING_WINDOW_MS } from "./job-duplicate.constants";
import { JobEventBus } from "./job-event.bus";
import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationSourceEnum } from "./job-source.enum";
import { inferJobSourceEnumFromUrls } from "./job-source.util";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEvent } from "./job-stage-events.schema";
import {
  CreateJobRepoDto,
  JobsRepository,
  UpdateJobRepoDto,
} from "./jobs.repository";
import { Job } from "./jobs.schema";
import { SalaryService } from "./salary/salary.service";
import { SalaryPeriodEnum } from "./salary/salary-period.enum";
import { TagService } from "./tags/tag.service";

type CreateDto = {
  title: string;
  company: string;
  companyId?: string | null;
  description?: string | null;
  urls?: string[] | null;
  source?: ApplicationSourceEnum | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriodEnum | null;
  tags?: string[] | null;
  location?: string | null;
  workRegion?: string | null;
  draftJobId?: string | null;
  sourceRunId?: string | null;
};
type UpdateDto = Partial<CreateDto>;
type CreateStageEventDto = {
  jobId: string;
  toStage: ApplicationStageEnum;
  source?: string;
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
    @InjectRepository(MatchAnalysisEntity)
    private readonly matchAnalysisRepo: Repository<MatchAnalysisEntity>,
    private readonly repo: JobsRepository,
    private readonly companyService: CompanyService,
    private readonly salaryService: SalaryService,
    private readonly tagService: TagService,
    private readonly companyDescriptionService: CompanyDescriptionService,
    private readonly draftJobsService: DraftJobsService,
    private readonly draftExtractionService: DraftExtractionService,
    private readonly draftExtractionNormalizationService: DraftExtractionNormalizationService,
    private readonly locationInferenceService: LocationInferenceService,
    private readonly eventBus: JobEventBus,
    private readonly draftEventBus: DraftJobEventBus,
  ) {}

  async findAll(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
    company?: string,
    runId?: string,
  ): Promise<JobWithCurrentStage[]> {
    const apps = await this.repo.findAllByUserId(
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
    const byId = await this.repo.findLatestStageSummariesByJobIds(
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
    const salaryColumns = this.salaryService.getCreateSalary(dto);
    const tags = this.tagService.normalizeTags(dto.tags);
    const normalizedUrls = this.normalizeUrls(dto.urls);

    const repoDto: CreateJobRepoDto = {
      title: dto.title,
      companyId,
      description: dto.description ?? null,
      urls: normalizedUrls,
      source:
        dto.source !== undefined
          ? dto.source
          : inferJobSourceEnumFromUrls(normalizedUrls),
      tags,
      location: dto.location ?? null,
      workRegion: dto.workRegion ?? null,
      draftJobId: dto.draftJobId ?? null,
      sourceRunId: dto.sourceRunId ?? null,
      ...salaryColumns,
    };

    const job = await this.repo.create(userId, repoDto);

    const duplicateLookbackMs = APPLICATION_DUPLICATE_PAIRING_WINDOW_MS;
    const referenceTime = new Date();
    const isDuplicate = await this.repo.hasRecentDuplicateSameRoleAndCompany(
      userId,
      job.id,
      companyId,
      dto.title,
      referenceTime,
      duplicateLookbackMs,
    );

    const initialStage = isDuplicate
      ? ApplicationStageEnum.DUPLICATED
      : ApplicationStageEnum.NEW;

    await this.repo.createStageEvent(userId, job.id, {
      fromStage: null,
      toStage: initialStage,
      source: "system",
      reason: null,
      scheduledAt: null,
    });
    const hydrated = await this.findOne(job.id, userId);

    if (dto.sourceRunId) {
      this.eventBus.emit(new JobCreated(job.id, userId));
    }

    return hydrated;
  }

  async createJobWithAI(
    userId: string,
    draftId: string,
  ): Promise<DraftJobType> {
    const draft = await this.draftJobsService.findOne(draftId, userId);
    if (
      draft.conversionMetadata?.status ===
      DraftJobConversionStatusEnum.PROCESSING
    ) {
      throw new BadRequestException("Draft conversion is already in progress.");
    }

    const updated = await this.draftJobsService.updateConversionMetadata(
      draftId,
      userId,
      null,
      { status: DraftJobConversionStatusEnum.PROCESSING },
    );

    if (!updated) {
      throw new BadRequestException("Draft conversion was already started.");
    }

    // Re-fetch to get updated metadata
    const queuedDraft = await this.draftJobsService.findOne(draftId, userId);

    this.draftEventBus.emit(
      new DraftConversionStatusChanged(
        draftId,
        userId,
        DraftJobConversionStatusEnum.PROCESSING,
      ),
    );

    this.draftEventBus.emit(new DraftConversionRequested(draftId, userId));

    return queuedDraft;
  }

  async processDraftConversion(userId: string, draftId: string): Promise<void> {
    const draft = await this.draftJobsService.findOne(draftId, userId);

    const [extractError, raw] = await tryRun(
      this.draftExtractionService.extract({
        title: draft.title,
        url: draft.url ?? null,
        htmlContent: draft.htmlContent,
      }),
    );

    if (extractError) {
      this.logger.error(
        `Draft conversion failed for ${draftId}: ${extractError.message}`,
        extractError.stack,
      );
      await this.safeUpdateDraftStatus(draftId, userId, extractError.message);
      return;
    }

    const normalized =
      this.draftExtractionNormalizationService.normalizeExtraction(raw);

    const [createError, created] = await tryRun(
      this.create(userId, {
        title: normalized.title,
        company: normalized.company,
        description: normalized.description,
        urls: draft.url?.trim() ? [draft.url.trim()] : [],
        salaryMinCents: normalized.salaryMinCents,
        salaryMaxCents: normalized.salaryMaxCents,
        salaryCurrency: normalized.salaryCurrency,
        salaryPeriod: normalized.salaryPeriod,
        tags: normalized.tags,
        location: normalized.location,
        workRegion: normalized.workRegion,
        draftJobId: draftId,
      }),
    );

    if (createError) {
      this.logger.error(
        `Draft conversion failed for ${draftId}: ${createError.message}`,
        createError.stack,
      );
      await this.safeUpdateDraftStatus(draftId, userId, createError.message);
      return;
    }

    const matchTransferResult = await this.matchAnalysisRepo.update(
      { draftJobId: draftId },
      { jobId: created.id },
    );

    if ((matchTransferResult.affected ?? 0) === 0) {
      this.eventBus.emit(new JobCreated(created.id, userId));
    }

    if (created.currentStage !== ApplicationStageEnum.DUPLICATED) {
      const [appliedError] = await tryRun(
        this.createStageEvent(userId, {
          jobId: created.id,
          toStage: ApplicationStageEnum.APPLIED,
          source: "system",
        }),
      );

      if (appliedError) {
        this.logger.error(
          `Draft conversion failed for ${draftId}: ${appliedError.message}`,
          appliedError.stack,
        );
        await this.draftJobsService.updateConversionMetadata(
          draftId,
          userId,
          { status: DraftJobConversionStatusEnum.PROCESSING },
          {
            status: DraftJobConversionStatusEnum.FAILED,
            error: appliedError.message,
            timestamp: new Date(),
          },
        );
        this.draftEventBus.emit(
          new DraftConversionStatusChanged(
            draftId,
            userId,
            DraftJobConversionStatusEnum.FAILED,
          ),
        );
        return;
      }
    }

    const normalizedDraftTitle =
      `${created.title} @ ${normalized.company}`.trim();

    await this.draftJobsService.update(draftId, userId, {
      title: normalizedDraftTitle,
    });

    await this.draftJobsService.updateConversionMetadata(
      draftId,
      userId,
      { status: DraftJobConversionStatusEnum.PROCESSING },
      { status: DraftJobConversionStatusEnum.SUCCEEDED, timestamp: new Date() },
    );

    this.draftEventBus.emit(
      new DraftConversionStatusChanged(
        draftId,
        userId,
        DraftJobConversionStatusEnum.SUCCEEDED,
      ),
    );
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
      await this.repo.findUpToTwoJobPostingContextsByCompanyName(
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
    const salaryColumns = this.salaryService.getUpdateSalary(existing, dto);
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
      ...(salaryColumns ?? {}),
    };

    const updated = await this.repo.update(id, userId, repoDto);

    if (!updated) throw new NotFoundException(`Job ${id} not found`);

    this.eventBus.emit(new JobUpdated(id, userId));

    return (await this.attachCurrentStage(userId, [updated]))[0]!;
  }

  private async resolveCompanyId(
    userId: string,
    companyName?: string,
    companyId?: string | null,
  ): Promise<string | undefined> {
    if (companyId) {
      const company = await this.companyService.findOne(companyId, userId);
      return company.id;
    }
    if (companyName) {
      const company = await this.companyService.findOrCreateByName(
        userId,
        companyName,
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
    return this.repo.findStageEventsByJobIdAndUserId(jobId, userId);
  }

  async createStageEvent(
    userId: string,
    dto: CreateStageEventDto,
  ): Promise<JobStageEvent> {
    await this.findOne(dto.jobId, userId);
    const latest = await this.repo.findLatestStageEventByJobIdAndUserId(
      dto.jobId,
      userId,
    );
    const event = await this.repo.createStageEvent(userId, dto.jobId, {
      fromStage: latest?.toStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? "manual",
      reason: dto.reason ?? null,
      scheduledAt: dto.scheduledAt ?? null,
    });

    this.eventBus.emit(new JobUpdated(dto.jobId, userId));
    return event;
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: UpdateStageEventDto,
  ): Promise<JobStageEvent> {
    const stageEvent = await this.repo.findStageEventByIdAndUserId(
      stageEventId,
      userId,
    );
    if (!stageEvent) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    const updated = await this.repo.updateStageEvent(stageEventId, userId, {
      toStage: dto.toStage,
      reason: dto.reason,
      scheduledAt: dto.scheduledAt,
    });
    if (!updated) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    this.eventBus.emit(new JobUpdated(stageEvent.jobId, userId));
    return updated;
  }

  async removeStageEvent(stageEventId: string, userId: string): Promise<void> {
    const stageEvent = await this.repo.findStageEventByIdAndUserId(
      stageEventId,
      userId,
    );
    if (!stageEvent) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    const deleted = await this.repo.deleteStageEvent(stageEventId, userId);
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

  async findDraftJobId(id: string, userId: string): Promise<string | null> {
    return this.repo.findDraftJobId(id, userId);
  }

  private async safeUpdateDraftStatus(
    draftId: string,
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    const [updateError] = await tryRun(
      this.draftJobsService.updateConversionMetadata(
        draftId,
        userId,
        { status: DraftJobConversionStatusEnum.PROCESSING },
        {
          status: DraftJobConversionStatusEnum.FAILED,
          error: errorMessage,
          timestamp: new Date(),
        },
      ),
    );
    if (updateError) {
      this.logger.warn(
        `Failed to update draft ${draftId} status — draft may have been deleted`,
      );
    }

    this.draftEventBus.emit(
      new DraftConversionStatusChanged(
        draftId,
        userId,
        DraftJobConversionStatusEnum.FAILED,
      ),
    );
  }
}
