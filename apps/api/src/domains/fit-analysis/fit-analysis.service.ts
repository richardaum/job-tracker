import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import {
  FitAnalysisEntity,
  FitAnalysisStatus,
  type FitItem,
  RequirementType,
} from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import type { Application } from "@api/domains/applications/applications.schema";
import { DraftApplicationsRepository } from "@api/domains/draft-applications/draft-applications.repository";
import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { FitAnalysisRepository } from "./fit-analysis.repository";
import { FitAnalysis } from "./fit-analysis.schema";
import { FitAnalysisAiService } from "./fit-analysis-ai.service";
import { FitAnalysisEventBus } from "./fit-analysis-event.bus";
import { computeScore } from "./scoring/scoring";

@Injectable()
export class FitAnalysisService implements OnModuleInit {
  private readonly logger = new Logger(FitAnalysisService.name);

  constructor(
    private readonly repo: FitAnalysisRepository,
    private readonly aiService: FitAnalysisAiService,
    private readonly applicationRepo: ApplicationRepository,
    private readonly draftRepo: DraftApplicationsRepository,
    private readonly eventBus: FitAnalysisEventBus,
    @InjectRepository(ResumeEntity)
    private readonly resumeRepo: Repository<ResumeEntity>,
    @InjectRepository(UserPreferencesEntity)
    private readonly preferencesRepo: Repository<UserPreferencesEntity>,
  ) {}

  async onModuleInit() {
    const recovered = await this.repo.resetStaleProcessing();
    if (recovered > 0) {
      this.logger.warn(
        `Recovered ${recovered} stale fit analysis records back to failed`,
      );
    }
  }

  async findById(id: string, userId: string): Promise<FitAnalysis | null> {
    return this.repo.findById(id, userId);
  }

  async findForApplication(
    applicationId: string,
    userId: string,
  ): Promise<FitAnalysis | null> {
    return this.repo.findByApplicationId(applicationId, userId);
  }

  async findForDraftApplication(
    draftApplicationId: string,
    userId: string,
  ): Promise<FitAnalysis | null> {
    const draft = await this.draftRepo.findOne(draftApplicationId, userId);
    if (!draft) return null;
    return this.repo.findByDraftApplicationId(draftApplicationId, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.repo.deleteById(id, userId);
    if (!deleted) {
      throw new BadRequestException("Fit analysis not found.");
    }
  }

  async findAll(userId: string): Promise<FitAnalysis[]> {
    return this.repo.findAllByUserId(userId);
  }

  async findApplicationById(
    id: string,
    userId: string,
  ): Promise<Application | null> {
    return this.applicationRepo.findOneByIdAndUserId(id, userId);
  }

  async findDraftApplicationById(
    id: string,
    userId: string,
  ): Promise<DraftApplicationEntity | null> {
    return this.draftRepo.findOne(id, userId);
  }

  async generate(
    applicationId: string,
    resumeId: string,
    userId: string,
  ): Promise<FitAnalysis> {
    const application = await this.applicationRepo.findOneByIdAndUserId(
      applicationId,
      userId,
    );
    if (!application) {
      throw new BadRequestException("Application not found.");
    }
    if (!application.description?.trim()) {
      throw new BadRequestException(
        "Application has no job description to analyze.",
      );
    }

    const resume = await this.resumeRepo.findOne({
      where: { id: resumeId, userId },
    });
    if (!resume) {
      throw new BadRequestException("Resume not found.");
    }

    const existing = await this.repo.findByApplicationId(applicationId);

    const entity = new FitAnalysisEntity();
    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
    }
    entity.applicationId = applicationId;
    entity.draftApplicationId = existing?.draftApplicationId ?? null;
    entity.userId = userId;
    entity.resumeId = resumeId;
    entity.status = FitAnalysisStatus.PROCESSING;
    entity.error = null;
    entity.items = [];
    entity.scoreRatio = null;
    entity.classification = null;
    entity.fitCount = 0;
    entity.gapCount = 0;
    entity.unclearCount = 0;

    const saved = await this.repo.upsert(entity);

    this.eventBus.emitFitStatusChanged(
      saved.id,
      userId,
      FitAnalysisStatus.PROCESSING,
    );
    void this.generateInBackground(saved.id, userId, { applicationId });

    return saved;
  }

  async generateForDraft(
    draftApplicationId: string,
    resumeId: string,
    userId: string,
  ): Promise<FitAnalysis> {
    const draft = await this.draftRepo.findOne(draftApplicationId, userId);
    if (!draft) {
      throw new BadRequestException("Draft application not found.");
    }
    if (!draft.htmlContent?.trim()) {
      throw new BadRequestException("Draft has no content to analyze.");
    }

    const resume = await this.resumeRepo.findOne({
      where: { id: resumeId, userId },
    });
    if (!resume) {
      throw new BadRequestException("Resume not found.");
    }

    const existing =
      await this.repo.findByDraftApplicationId(draftApplicationId);

    const entity = new FitAnalysisEntity();
    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
    }
    entity.applicationId = existing?.applicationId ?? null;
    entity.draftApplicationId = draftApplicationId;
    entity.userId = userId;
    entity.resumeId = resumeId;
    entity.status = FitAnalysisStatus.PROCESSING;
    entity.error = null;
    entity.items = [];
    entity.scoreRatio = null;
    entity.classification = null;
    entity.fitCount = 0;
    entity.gapCount = 0;
    entity.unclearCount = 0;

    const saved = await this.repo.upsert(entity);

    this.eventBus.emitFitStatusChanged(
      saved.id,
      userId,
      FitAnalysisStatus.PROCESSING,
    );
    void this.generateInBackground(saved.id, userId, { draftApplicationId });

    return saved;
  }

  private async generateInBackground(
    fitId: string,
    userId: string,
    source: { applicationId?: string; draftApplicationId?: string },
  ): Promise<void> {
    const [err] = await tryRun(async () => {
      const preferences = await this.preferencesRepo.findOne({
        where: { userId },
      });

      let jdText: string;

      if (source.applicationId) {
        const application = await this.applicationRepo.findOneByIdAndUserId(
          source.applicationId,
          userId,
        );
        if (!application?.description) return;
        jdText = application.description;
      } else if (source.draftApplicationId) {
        const draft = await this.draftRepo.findOne(
          source.draftApplicationId,
          userId,
        );
        if (!draft?.htmlContent) return;
        jdText = htmlToPlainText(draft.htmlContent);
      } else {
        return;
      }

      const resume = await this.repo.findById(fitId, userId);
      if (!resume?.resumeId) return;

      const resumeEntity = await this.resumeRepo.findOne({
        where: { id: resume.resumeId, userId },
      });
      if (!resumeEntity) return;

      const resumeText = tipTapToPlainText(resumeEntity.content);

      const resumeFitItems = await this.aiService.extractResumeFitItems(
        jdText,
        resumeText,
      );

      const preferenceItems = preferences?.items ?? [];
      const preferenceFitItems = await this.aiService.extractPreferenceFitItems(
        jdText,
        preferenceItems,
      );

      const items: FitItem[] = [
        ...resumeFitItems.map(
          (i): FitItem => ({
            requirement: i.requirement,
            source: "resume",
            type: i.type as RequirementType,
            verdict: i.verdict,
            jdQuote: i.jdQuote,
            sourceQuotes: i.sourceQuotes,
            suggestion: i.suggestion ?? undefined,
          }),
        ),
        ...preferenceFitItems.map((i, index): FitItem => {
          const original = preferenceItems[index];
          return {
            requirement: i.requirement,
            source: "preference",
            weight: original?.weight,
            type: i.type as RequirementType,
            verdict: i.verdict,
            jdQuote: i.jdQuote,
            sourceQuotes: [],
            suggestion: i.suggestion ?? undefined,
          };
        }),
      ];

      const score = computeScore(items);

      const success = await this.repo.updateStatusById(
        fitId,
        FitAnalysisStatus.PROCESSING,
        {
          status: FitAnalysisStatus.COMPLETED,
          resumeId: resume.resumeId,
          items,
          scoreRatio: score.scoreRatio,
          classification: score.classification,
          fitCount: score.fitCount,
          gapCount: score.gapCount,
          unclearCount: score.unclearCount,
          error: null,
        },
        userId,
      );

      if (!success) {
        this.logger.warn(
          `Fit analysis ${fitId} was already updated or reset. Skipping background save.`,
        );
      }

      this.eventBus.emitFitStatusChanged(
        fitId,
        userId,
        FitAnalysisStatus.COMPLETED,
      );
    });

    if (err) {
      this.logger.error(
        `[FitAnalysis] Background generation failed for fit ${fitId}:`,
        err instanceof Error ? err.stack : err,
      );

      await this.repo.updateStatusById(
        fitId,
        FitAnalysisStatus.PROCESSING,
        {
          status: FitAnalysisStatus.FAILED,
          error: err instanceof Error ? err.message : "Unknown error",
        },
        userId,
      );

      this.eventBus.emitFitStatusChanged(
        fitId,
        userId,
        FitAnalysisStatus.FAILED,
      );
    }
  }
}
