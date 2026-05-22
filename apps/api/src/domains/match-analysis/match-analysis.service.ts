import { DraftJobEntity } from "@api/database/entities/draft-job.entity";
import {
  MatchAnalysisEntity,
  type MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import type { Job } from "@api/domains/jobs/jobs.schema";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { FitSourceEnum } from "./fit-source.enum";
import {
  MatchAnalysisRequested,
  MatchStatusChanged,
} from "./match-analysis.events";
import { MatchAnalysisRepository } from "./match-analysis.repository";
import { MatchAnalysis } from "./match-analysis.schema";
import { MatchAnalysisAiService } from "./match-analysis-ai.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";
import { computeScore } from "./scoring/scoring";

@Injectable()
export class MatchAnalysisService implements OnModuleInit {
  private readonly logger = new Logger(MatchAnalysisService.name);

  constructor(
    private readonly repo: MatchAnalysisRepository,
    private readonly aiService: MatchAnalysisAiService,
    private readonly jobRepo: JobsRepository,
    private readonly eventBus: MatchAnalysisEventBus,
    @InjectRepository(ResumeEntity)
    private readonly resumeRepo: Repository<ResumeEntity>,
    @InjectRepository(WorkPreferencesEntity)
    private readonly preferencesRepo: Repository<WorkPreferencesEntity>,
  ) {}

  async onModuleInit() {
    const recovered = await this.repo.resetStaleProcessing();
    if (recovered > 0) {
      this.logger.warn(
        `Recovered ${recovered} stale match analysis records back to failed`,
      );
    }
  }

  async findById(id: string, userId: string): Promise<MatchAnalysis> {
    const match = await this.repo.findById(id, userId);
    if (!match) {
      throw new NotFoundException("Match analysis not found");
    }
    return match;
  }

  async findForJob(
    jobId: string,
    userId: string,
  ): Promise<MatchAnalysis | null> {
    return this.repo.findByJobId(jobId, userId);
  }

  async findForDraftJob(
    draftJobId: string,
    userId: string,
  ): Promise<MatchAnalysis | null> {
    const job = await this.jobRepo.findOneByIdAndUserId(draftJobId, userId);
    if (!job) {
      return null;
    }
    return this.repo.findByJobId(draftJobId, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.repo.deleteById(id, userId);
    if (!deleted) {
      throw new BadRequestException("Match analysis not found.");
    }
  }

  async findAll(userId: string): Promise<MatchAnalysis[]> {
    return this.repo.findAllByUserId(userId);
  }

  async findJobById(id: string, userId: string): Promise<Job | null> {
    return this.jobRepo.findOneByIdAndUserId(id, userId);
  }

  async findDraftJobById(
    _id: string,
    _userId: string,
  ): Promise<DraftJobEntity | null> {
    return Promise.resolve(null);
  }

  async generate(
    jobId: string,
    resumeId: string,
    userId: string,
  ): Promise<MatchAnalysis> {
    const job = await this.jobRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) {
      throw new BadRequestException("Job not found.");
    }
    const fromDesc = job.description?.trim()
      ? tipTapToPlainText(job.description)
      : "";
    const fromHtml = job.htmlContent?.trim()
      ? htmlToPlainText(job.htmlContent)
      : "";
    if (!fromDesc.trim() && !fromHtml.trim()) {
      throw new BadRequestException(
        "Job has no captured HTML or job description to analyze.",
      );
    }

    const resume = await this.resumeRepo.findOne({
      where: { id: resumeId, userId },
    });
    if (!resume) {
      throw new BadRequestException("Resume not found.");
    }

    const existing = await this.repo.findByJobId(jobId);

    const entity = new MatchAnalysisEntity();
    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
    }
    entity.jobId = jobId;
    entity.userId = userId;
    entity.resumeId = resumeId;
    entity.generationMetadata = {
      status: AsyncMetadataStatusEnum.PROCESSING,
      error: null,
      timestamp: new Date(),
    };
    entity.items = [];
    entity.scoreRatio = null;
    entity.classification = null;
    entity.matchCount = 0;
    entity.gapCount = 0;
    entity.unclearCount = 0;

    const saved = await this.repo.upsert(entity);

    this.eventBus.emit(
      new MatchStatusChanged(
        saved.id,
        userId,
        AsyncMetadataStatusEnum.PROCESSING,
      ),
    );
    this.eventBus.emit(new MatchAnalysisRequested(saved.id, userId, { jobId }));

    return saved;
  }

  async generateForDraft(
    draftJobId: string,
    resumeId: string,
    userId: string,
  ): Promise<MatchAnalysis> {
    /** Legacy mutation name — `draftJobId` is a job PK after drafts merged into jobs. */
    return this.generate(draftJobId, resumeId, userId);
  }

  async processMatchAnalysis(
    matchId: string,
    userId: string,
    source: { jobId?: string; draftJobId?: string },
  ): Promise<void> {
    const [err] = await tryRun(async () => {
      const preferences = await this.preferencesRepo.findOne({
        where: { userId },
      });

      let jdText: string;

      if (source.jobId) {
        const job = await this.jobRepo.findOneByIdAndUserId(
          source.jobId,
          userId,
        );
        const trimmedHtml = job?.htmlContent?.trim();
        if (trimmedHtml) {
          jdText = htmlToPlainText(trimmedHtml);
        } else if (job?.description?.trim()) {
          jdText = job.description;
        } else {
          return;
        }
      } else if (source.draftJobId) {
        await this.processMatchAnalysis(matchId, userId, {
          jobId: source.draftJobId,
        });
        return;
      } else {
        return;
      }

      const resume = await this.repo.findById(matchId, userId);
      if (!resume?.resumeId) return;

      const resumeEntity = await this.resumeRepo.findOne({
        where: { id: resume.resumeId, userId },
      });
      if (!resumeEntity) return;

      const resumeText = tipTapToPlainText(resumeEntity.content);

      const resumeMatchItems = await this.aiService.extractResumeMatchItems(
        jdText,
        resumeText,
      );

      const preferenceItems = preferences?.items ?? [];
      const preferenceMatchItems =
        await this.aiService.extractPreferenceMatchItems(
          jdText,
          preferenceItems,
        );

      const items: MatchItem[] = [
        ...resumeMatchItems.map(
          (i): MatchItem => ({
            requirement: i.requirement,
            source: FitSourceEnum.Resume,
            type: i.type as RequirementTypeEnum,
            verdict: i.verdict,
            jdQuote: i.jdQuote,
            sourceQuotes: i.sourceQuotes,
            suggestion: i.suggestion ?? undefined,
          }),
        ),
        ...preferenceMatchItems.map((i, index): MatchItem => {
          const original = preferenceItems[index];
          return {
            requirement: i.requirement,
            source: FitSourceEnum.Preference,
            weight: original?.weight,
            type: i.type as RequirementTypeEnum,
            verdict: i.verdict,
            jdQuote: i.jdQuote,
            sourceQuotes: [],
            suggestion: i.suggestion ?? undefined,
          };
        }),
      ];

      const score = computeScore(items);

      const updated = await this.repo.updateById(
        matchId,
        AsyncMetadataStatusEnum.PROCESSING,
        {
          generationMetadata: {
            status: AsyncMetadataStatusEnum.COMPLETED,
            error: null,
            timestamp: new Date(),
          },
          resumeId: resume.resumeId,
          items,
          scoreRatio: score.scoreRatio,
          classification: score.classification,
          matchCount: score.matchCount,
          gapCount: score.gapCount,
          unclearCount: score.unclearCount,
        },
        userId,
      );

      if (!updated) {
        this.logger.warn(
          `Match analysis ${matchId} was already updated or reset. Skipping background save.`,
        );
      }

      this.eventBus.emit(
        new MatchStatusChanged(
          matchId,
          userId,
          AsyncMetadataStatusEnum.COMPLETED,
        ),
      );
    });

    if (err) {
      this.logger.error(
        `[MatchAnalysis] Background generation failed for match ${matchId}:`,
        err instanceof Error ? err.stack : err,
      );

      await this.repo.updateById(
        matchId,
        AsyncMetadataStatusEnum.PROCESSING,
        {
          generationMetadata: {
            status: AsyncMetadataStatusEnum.FAILED,
            error: err instanceof Error ? err.message : "Unknown error",
            timestamp: new Date(),
          },
        },
        userId,
      );

      this.eventBus.emit(
        new MatchStatusChanged(matchId, userId, AsyncMetadataStatusEnum.FAILED),
      );
    }
  }
}
