import { DraftApplicationConversionStatusEnum } from "@api/database/entities/draft-application.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/draft-applications/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/draft-applications/ai/draft-extraction-normalization.service";
import {
  DraftConversionRequested,
  DraftConversionStatusChanged,
} from "@api/domains/draft-applications/draft-application.events";
import { DraftApplicationType } from "@api/domains/draft-applications/draft-application.type";
import { DraftApplicationEventBus } from "@api/domains/draft-applications/draft-application-event.bus";
import { DraftApplicationsService } from "@api/domains/draft-applications/draft-applications.service";
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

import { ApplicationCreated, ApplicationUpdated } from "./application.events";
import { APPLICATION_DUPLICATE_PAIRING_WINDOW_MS } from "./application-duplicate.constants";
import { ApplicationEventBus } from "./application-event.bus";
import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
import { ApplicationSourceEnum } from "./application-source.enum";
import { inferApplicationSourceEnumFromUrls } from "./application-source.util";
import { ApplicationStageEnum } from "./application-stage.enum";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import {
  ApplicationRepository,
  CreateApplicationRepoDto,
  UpdateApplicationRepoDto,
} from "./applications.repository";
import { Application } from "./applications.schema";
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
  draftApplicationId?: string | null;
  sourceRunId?: string | null;
};
type UpdateDto = Partial<CreateDto>;
type CreateStageEventDto = {
  applicationId: string;
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

type ApplicationWithCurrentStage = Application & {
  currentStage: ApplicationStageEnum;
  currentStageReason: string | null;
  currentStageAt: Date;
};

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(SourceRunEntity)
    private readonly sourceRunsRepo: Repository<SourceRunEntity>,
    @InjectRepository(FitAnalysisEntity)
    private readonly fitAnalysisRepo: Repository<FitAnalysisEntity>,
    private readonly repo: ApplicationRepository,
    private readonly companyService: CompanyService,
    private readonly salaryService: SalaryService,
    private readonly tagService: TagService,
    private readonly companyDescriptionService: CompanyDescriptionService,
    private readonly draftApplicationsService: DraftApplicationsService,
    private readonly draftExtractionService: DraftExtractionService,
    private readonly draftExtractionNormalizationService: DraftExtractionNormalizationService,
    private readonly locationInferenceService: LocationInferenceService,
    private readonly eventBus: ApplicationEventBus,
    private readonly draftEventBus: DraftApplicationEventBus,
  ) {}

  async findAll(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
    company?: string,
    runId?: string,
  ): Promise<ApplicationWithCurrentStage[]> {
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

  async findOne(
    id: string,
    userId: string,
  ): Promise<ApplicationWithCurrentStage> {
    const app = await this.repo.findOneByIdAndUserId(id, userId);
    if (!app) throw new NotFoundException(`Application ${id} not found`);
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
    apps: Application[],
  ): Promise<ApplicationWithCurrentStage[]> {
    if (apps.length === 0) {
      return [];
    }
    const byId = await this.repo.findLatestStageSummariesByApplicationIds(
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

  async create(
    userId: string,
    dto: CreateDto,
  ): Promise<ApplicationWithCurrentStage> {
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

    const repoDto: CreateApplicationRepoDto = {
      title: dto.title,
      companyId,
      description: dto.description ?? null,
      urls: normalizedUrls,
      source:
        dto.source !== undefined
          ? dto.source
          : inferApplicationSourceEnumFromUrls(normalizedUrls),
      tags,
      location: dto.location ?? null,
      workRegion: dto.workRegion ?? null,
      draftApplicationId: dto.draftApplicationId ?? null,
      sourceRunId: dto.sourceRunId ?? null,
      ...salaryColumns,
    };

    const application = await this.repo.create(userId, repoDto);

    const duplicateLookbackMs = APPLICATION_DUPLICATE_PAIRING_WINDOW_MS;
    const referenceTime = new Date();
    const isDuplicate = await this.repo.hasRecentDuplicateSameRoleAndCompany(
      userId,
      application.id,
      companyId,
      dto.title,
      referenceTime,
      duplicateLookbackMs,
    );

    const initialStage = isDuplicate
      ? ApplicationStageEnum.DUPLICATED
      : ApplicationStageEnum.NEW;

    await this.repo.createStageEvent(userId, application.id, {
      fromStage: null,
      toStage: initialStage,
      source: "system",
      reason: null,
      scheduledAt: null,
    });
    const hydrated = await this.findOne(application.id, userId);

    if (dto.sourceRunId) {
      this.eventBus.emit(new ApplicationCreated(application.id, userId));
    }

    return hydrated;
  }

  async createApplicationWithAI(
    userId: string,
    draftId: string,
  ): Promise<DraftApplicationType> {
    const draft = await this.draftApplicationsService.findOne(draftId, userId);
    if (
      draft.conversionMetadata?.status ===
      DraftApplicationConversionStatusEnum.PROCESSING
    ) {
      throw new BadRequestException("Draft conversion is already in progress.");
    }

    const updated =
      await this.draftApplicationsService.updateConversionMetadata(
        draftId,
        userId,
        null,
        { status: DraftApplicationConversionStatusEnum.PROCESSING },
      );

    if (!updated) {
      throw new BadRequestException("Draft conversion was already started.");
    }

    // Re-fetch to get updated metadata
    const queuedDraft = await this.draftApplicationsService.findOne(
      draftId,
      userId,
    );

    this.draftEventBus.emit(
      new DraftConversionStatusChanged(
        draftId,
        userId,
        DraftApplicationConversionStatusEnum.PROCESSING,
      ),
    );

    this.draftEventBus.emit(new DraftConversionRequested(draftId, userId));

    return queuedDraft;
  }

  async processDraftConversion(userId: string, draftId: string): Promise<void> {
    const draft = await this.draftApplicationsService.findOne(draftId, userId);

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
        draftApplicationId: draftId,
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

    const fitTransferResult = await this.fitAnalysisRepo.update(
      { draftApplicationId: draftId },
      { applicationId: created.id },
    );

    if ((fitTransferResult.affected ?? 0) === 0) {
      this.eventBus.emit(new ApplicationCreated(created.id, userId));
    }

    if (created.currentStage !== ApplicationStageEnum.DUPLICATED) {
      const [appliedError] = await tryRun(
        this.createStageEvent(userId, {
          applicationId: created.id,
          toStage: ApplicationStageEnum.APPLIED,
          source: "system",
        }),
      );

      if (appliedError) {
        this.logger.error(
          `Draft conversion failed for ${draftId}: ${appliedError.message}`,
          appliedError.stack,
        );
        await this.draftApplicationsService.updateConversionMetadata(
          draftId,
          userId,
          { status: DraftApplicationConversionStatusEnum.PROCESSING },
          {
            status: DraftApplicationConversionStatusEnum.FAILED,
            error: appliedError.message,
            timestamp: new Date().toISOString(),
          },
        );
        this.draftEventBus.emit(
          new DraftConversionStatusChanged(
            draftId,
            userId,
            DraftApplicationConversionStatusEnum.FAILED,
          ),
        );
        return;
      }
    }

    const normalizedDraftTitle =
      `${created.title} @ ${normalized.company}`.trim();

    await this.draftApplicationsService.update(draftId, userId, {
      title: normalizedDraftTitle,
    });

    await this.draftApplicationsService.updateConversionMetadata(
      draftId,
      userId,
      { status: DraftApplicationConversionStatusEnum.PROCESSING },
      {
        status: DraftApplicationConversionStatusEnum.SUCCEEDED,
        timestamp: new Date().toISOString(),
      },
    );

    this.draftEventBus.emit(
      new DraftConversionStatusChanged(
        draftId,
        userId,
        DraftApplicationConversionStatusEnum.SUCCEEDED,
      ),
    );
  }

  async inferApplicationLocation(
    userId: string,
    applicationId: string,
  ): Promise<string | null> {
    const app = await this.findOne(applicationId, userId);
    const plainText = tipTapToPlainText(app.description);
    return this.locationInferenceService.inferLocation(plainText);
  }

  async inferApplicationWorkRegion(
    userId: string,
    applicationId: string,
  ): Promise<string | null> {
    const app = await this.findOne(applicationId, userId);
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
  ): Promise<ApplicationWithCurrentStage> {
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

    const repoDto: UpdateApplicationRepoDto = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(companyId !== undefined ? { companyId } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(normalizedUrls !== undefined ? { urls: normalizedUrls } : {}),
      ...(dto.source !== undefined
        ? { source: dto.source }
        : normalizedUrls !== undefined
          ? { source: inferApplicationSourceEnumFromUrls(normalizedUrls) }
          : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(dto.location !== undefined ? { location: dto.location } : {}),
      ...(dto.workRegion !== undefined ? { workRegion: dto.workRegion } : {}),
      ...(salaryColumns ?? {}),
    };

    const updated = await this.repo.update(id, userId, repoDto);

    if (!updated) throw new NotFoundException(`Application ${id} not found`);

    this.eventBus.emit(new ApplicationUpdated(id, userId));

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

  async remove(
    id: string,
    userId: string,
  ): Promise<ApplicationWithCurrentStage> {
    await this.findOne(id, userId);
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new NotFoundException(`Application ${id} not found`);
    return (await this.attachCurrentStage(userId, [deleted]))[0]!;
  }

  async listStageEvents(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent[]> {
    await this.findOne(applicationId, userId);
    return this.repo.findStageEventsByApplicationIdAndUserId(
      applicationId,
      userId,
    );
  }

  async createStageEvent(
    userId: string,
    dto: CreateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    await this.findOne(dto.applicationId, userId);
    const latest = await this.repo.findLatestStageEventByApplicationIdAndUserId(
      dto.applicationId,
      userId,
    );
    const event = await this.repo.createStageEvent(userId, dto.applicationId, {
      fromStage: latest?.toStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? "manual",
      reason: dto.reason ?? null,
      scheduledAt: dto.scheduledAt ?? null,
    });

    this.eventBus.emit(new ApplicationUpdated(dto.applicationId, userId));
    return event;
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: UpdateStageEventDto,
  ): Promise<ApplicationStageEvent> {
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

    this.eventBus.emit(
      new ApplicationUpdated(stageEvent.applicationId, userId),
    );
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

    this.eventBus.emit(
      new ApplicationUpdated(stageEvent.applicationId, userId),
    );
  }

  async removeTag(
    id: string,
    userId: string,
    tag: string,
  ): Promise<ApplicationWithCurrentStage> {
    const existing = await this.findOne(id, userId);
    const tags = (existing.tags ?? []).filter(
      (t) => t.toLowerCase() !== tag.toLowerCase(),
    );
    const updated = await this.repo.update(id, userId, { tags });
    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return (await this.attachCurrentStage(userId, [updated]))[0]!;
  }

  async findDraftApplicationId(
    id: string,
    userId: string,
  ): Promise<string | null> {
    return this.repo.findDraftApplicationId(id, userId);
  }

  private async safeUpdateDraftStatus(
    draftId: string,
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    const [updateError] = await tryRun(
      this.draftApplicationsService.updateConversionMetadata(
        draftId,
        userId,
        { status: DraftApplicationConversionStatusEnum.PROCESSING },
        {
          status: DraftApplicationConversionStatusEnum.FAILED,
          error: errorMessage,
          timestamp: new Date().toISOString(),
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
        DraftApplicationConversionStatusEnum.FAILED,
      ),
    );
  }
}
