import {
  FitAnalysisEntity,
  FitAnalysisStatus,
  type FitItem,
  RequirementType,
} from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { tipTapDocumentToPlainText } from "@api/domains/shared/tiptap.util";
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
import { computeScore } from "./scoring/scoring";

@Injectable()
export class FitAnalysisService implements OnModuleInit {
  private readonly logger = new Logger(FitAnalysisService.name);

  constructor(
    private readonly repo: FitAnalysisRepository,
    private readonly aiService: FitAnalysisAiService,
    private readonly applicationRepo: ApplicationRepository,
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

  async findForApplication(
    applicationId: string,
    _userId: string,
  ): Promise<FitAnalysis | null> {
    return this.repo.findByApplicationId(applicationId);
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

    void this.generateInBackground(applicationId, resumeId, userId);

    return saved;
  }

  private async generateInBackground(
    applicationId: string,
    resumeId: string,
    userId: string,
  ): Promise<void> {
    const [err] = await tryRun(async () => {
      const preferences = await this.preferencesRepo.findOne({
        where: { userId },
      });

      const application = await this.applicationRepo.findOneByIdAndUserId(
        applicationId,
        userId,
      );
      const resume = await this.resumeRepo.findOne({
        where: { id: resumeId, userId },
      });
      if (!application?.description || !resume) return;

      const jdText = application.description;
      const resumeText = tipTapDocumentToPlainText(resume.content);

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
        ...preferenceFitItems.map((i): FitItem => {
          const original = preferenceItems.find(
            (p) => p.text === i.requirement,
          );
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

      const success = await this.repo.updateStatus(
        applicationId,
        FitAnalysisStatus.PROCESSING,
        {
          status: FitAnalysisStatus.COMPLETED,
          resumeId,
          items,
          scoreRatio: score.scoreRatio,
          classification: score.classification,
          fitCount: score.fitCount,
          gapCount: score.gapCount,
          unclearCount: score.unclearCount,
          error: null,
        },
      );

      if (!success) {
        this.logger.warn(
          `Fit analysis for application ${applicationId} was already updated or reset. Skipping background save.`,
        );
      }
    });

    if (err) {
      this.logger.error(
        `[FitAnalysis] Background generation failed for application ${applicationId}:`,
        err instanceof Error ? err.stack : err,
      );

      await this.repo.updateStatus(
        applicationId,
        FitAnalysisStatus.PROCESSING,
        {
          status: FitAnalysisStatus.FAILED,
          error: err instanceof Error ? err.message : "Unknown error",
        },
      );
    }
  }
}
