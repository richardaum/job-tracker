import { DraftJobEntity } from "@api/database/entities/draft-job.entity";
import {
  MatchAnalysisEntity,
  type MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { DraftJobsRepository } from "@api/domains/draft-jobs/draft-jobs.repository";
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
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

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
    private readonly draftRepo: DraftJobsRepository,
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

  async findById(id: string, userId: string): Promise<MatchAnalysis | null> {
    return this.repo.findById(id, userId);
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
    const draft = await this.draftRepo.findOne(draftJobId, userId);
    if (!draft) return null;
    return this.repo.findByDraftJobId(draftJobId, userId);
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
    id: string,
    userId: string,
  ): Promise<DraftJobEntity | null> {
    return this.draftRepo.findOne(id, userId);
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
    if (!job.description?.trim()) {
      throw new BadRequestException("Job has no job description to analyze.");
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
    entity.draftJobId = existing?.draftJobId ?? null;
    entity.userId = userId;
    entity.resumeId = resumeId;
    entity.generationMetadata = {
      status: AsyncMetadataStatusEnum.PROCESSING,
      timestamp: new Date().toISOString(),
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
    const draft = await this.draftRepo.findOne(draftJobId, userId);
    if (!draft) {
      throw new BadRequestException("Draft job not found.");
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

    const existing = await this.repo.findByDraftJobId(draftJobId);

    const entity = new MatchAnalysisEntity();
    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
    }
    entity.jobId = existing?.jobId ?? null;
    entity.draftJobId = draftJobId;
    entity.userId = userId;
    entity.resumeId = resumeId;
    entity.generationMetadata = {
      status: AsyncMetadataStatusEnum.PROCESSING,
      timestamp: new Date().toISOString(),
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
    this.eventBus.emit(
      new MatchAnalysisRequested(saved.id, userId, { draftJobId }),
    );

    return saved;
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
        if (!job?.description) return;
        jdText = job.description;
      } else if (source.draftJobId) {
        const draft = await this.draftRepo.findOne(source.draftJobId, userId);
        if (!draft?.htmlContent) return;
        jdText = htmlToPlainText(draft.htmlContent);
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
            source: "resume",
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
            source: "preference",
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
            timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
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
