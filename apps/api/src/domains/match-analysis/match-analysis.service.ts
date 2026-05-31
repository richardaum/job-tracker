import { MatchAnalysisEntity, type MatchItem, RequirementTypeEnum } from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import type { Job } from "@api/domains/jobs/jobs.schema";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { resolveJobPostingPlainText } from "./job-posting-plain-text.util";
import { MatchAnalysisRequested, MatchStatusChanged } from "./match-analysis.events";
import { MatchAnalysisRepository } from "./match-analysis.repository";
import { MatchAnalysis } from "./match-analysis.schema";
import { MatchAnalysisAiService } from "./match-analysis-ai.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";
import { createMatchItemId } from "./match-item-id.util";
import { MatchSourceEnum } from "./match-source.enum";
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
      this.logger.warn(`Recovered ${recovered} stale match analysis records back to failed`);
    }
  }

  async findById(id: string, userId: string): Promise<MatchAnalysis> {
    const match = await this.repo.findById(id, userId);
    if (!match) {
      throw new NotFoundException("Match analysis not found");
    }
    return match;
  }

  async findForJob(jobId: string, userId: string): Promise<MatchAnalysis | null> {
    return this.repo.findByJobId(jobId, userId);
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

  async generate(jobId: string, resumeId: string, userId: string): Promise<MatchAnalysis> {
    const job = await this.jobRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) {
      throw new BadRequestException("Job not found.");
    }
    const jdPlain = resolveJobPostingPlainText(job);
    if (!jdPlain) {
      throw new BadRequestException("Job has no description or htmlContent.");
    }

    const resume = await this.resumeRepo.findOne({ where: { id: resumeId, userId } });
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
    entity.generationMetadata = { status: AsyncMetadataStatusEnum.PROCESSING, error: null, timestamp: new Date() };
    entity.items = [];
    entity.scoreRatio = null;
    entity.classification = null;
    entity.matchCount = 0;
    entity.gapCount = 0;
    entity.unclearCount = 0;

    const saved = await this.repo.upsert(entity);

    this.eventBus.emit(new MatchStatusChanged(saved.id, userId, jobId, AsyncMetadataStatusEnum.PROCESSING));
    this.eventBus.emit(new MatchAnalysisRequested(saved.id, userId, { jobId }));

    return saved;
  }

  /** Clears PROCESSING after the request was persisted (enqueue); mirrors AI-error path. */
  private async failMatchProcessing(matchId: string, userId: string, jobId: string, message: string): Promise<void> {
    const updated = await this.repo.updateById(
      matchId,
      AsyncMetadataStatusEnum.PROCESSING,
      { generationMetadata: { status: AsyncMetadataStatusEnum.FAILED, error: message, timestamp: new Date() } },
      userId,
    );

    if (!updated) {
      this.logger.warn(
        `Match analysis ${matchId} was not in PROCESSING state; skipping FAILED lifecycle event (${message}).`,
      );
      return;
    }

    this.eventBus.emit(new MatchStatusChanged(matchId, userId, jobId, AsyncMetadataStatusEnum.FAILED));
  }

  async processMatchAnalysis(matchId: string, userId: string, source: { jobId: string }): Promise<void> {
    const [err] = await tryRun(async () => {
      const preferences = await this.preferencesRepo.findOne({ where: { userId } });

      const job = await this.jobRepo.findOneByIdAndUserId(source.jobId, userId);

      if (!job) {
        await this.failMatchProcessing(matchId, userId, source.jobId, "Job not found.");
        return;
      }

      const jdText = resolveJobPostingPlainText(job);
      if (!jdText) {
        await this.failMatchProcessing(matchId, userId, source.jobId, "Job has no description or htmlContent.");
        return;
      }

      const resume = await this.repo.findById(matchId, userId);
      if (!resume?.resumeId) {
        await this.failMatchProcessing(matchId, userId, source.jobId, "Match analysis has no resume linked.");
        return;
      }

      const resumeEntity = await this.resumeRepo.findOne({ where: { id: resume.resumeId, userId } });
      if (!resumeEntity) {
        await this.failMatchProcessing(matchId, userId, source.jobId, "Resume not found.");
        return;
      }

      const resumeText = tipTapToPlainText(resumeEntity.content);

      const resumeMatchItems = await this.aiService.extractResumeMatchItems(jdText, resumeText);

      const preferenceItems = preferences?.items ?? [];
      const preferenceMatchItems = await this.aiService.extractPreferenceMatchItems(jdText, preferenceItems);

      const items: MatchItem[] = [
        ...resumeMatchItems.map(
          (i): MatchItem => ({
            id: createMatchItemId(),
            requirement: i.requirement,
            source: MatchSourceEnum.Resume,
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
            id: createMatchItemId(),
            requirement: i.requirement,
            source: MatchSourceEnum.Preference,
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
          generationMetadata: { status: AsyncMetadataStatusEnum.COMPLETED, error: null, timestamp: new Date() },
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
        this.logger.warn(`Match analysis ${matchId} was already updated or reset. Skipping background save.`);
        return;
      }

      this.eventBus.emit(new MatchStatusChanged(matchId, userId, source.jobId, AsyncMetadataStatusEnum.COMPLETED));
    });

    if (err) {
      this.logger.error(
        `[MatchAnalysis] Background generation failed for match ${matchId}:`,
        err instanceof Error ? err.stack : err,
      );

      await this.failMatchProcessing(
        matchId,
        userId,
        source.jobId,
        err instanceof Error ? err.message : "Unknown error",
      );
    }
  }
}
