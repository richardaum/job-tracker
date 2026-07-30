import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { SummaryGenerationRequested, SummaryStatusChanged } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import { markdownToTipTap, tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SummaryAiService } from "./summary-ai.service";

@Injectable()
export class JobSummaryService implements OnModuleInit {
  private readonly logger = new Logger(JobSummaryService.name);

  constructor(
    private readonly summaryAiService: SummaryAiService,
    private readonly eventBus: JobEventBus,
    private readonly jobsRepo: JobsRepository,
    @InjectRepository(JobStageEventEntity)
    private readonly stageEventsRepo: Repository<JobStageEventEntity>,
    @InjectRepository(JobNoteEntity)
    private readonly notesRepo: Repository<JobNoteEntity>,
  ) {}

  onModuleInit(): void {
    void this.resetStaleProcessing();
  }

  private async resetStaleProcessing(): Promise<void> {
    const count = await this.jobsRepo.resetStaleSummaryProcessing();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale PROCESSING summaries`);
    }
  }

  async requestSummary(jobId: string, userId: string): Promise<void> {
    const job = await this.jobsRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) {
      this.logger.warn(`Job ${jobId} not found, skipping`);
      return;
    }

    if (job.summaryMetadata?.status === AsyncMetadataStatusEnum.Processing) return;

    const ok = await this.jobsRepo.updateSummaryMetadataIfStatus(jobId, userId, job.summaryMetadata?.status ?? null, {
      status: AsyncMetadataStatusEnum.Processing,
    });
    if (!ok) return;

    this.eventBus.emit(new SummaryStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Processing));

    this.eventBus.emit(new SummaryGenerationRequested(jobId, userId));
  }

  async requestSummarySync(jobId: string, userId: string): Promise<void> {
    const job = await this.jobsRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) return;

    if (job.summaryMetadata?.status === AsyncMetadataStatusEnum.Processing) return;

    const ok = await this.jobsRepo.updateSummaryMetadataIfStatus(jobId, userId, job.summaryMetadata?.status ?? null, {
      status: AsyncMetadataStatusEnum.Processing,
    });
    if (!ok) return;

    this.eventBus.emit(new SummaryStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Processing));

    this.eventBus.emit(new SummaryGenerationRequested(jobId, userId));
  }

  async doGenerate(jobId: string, userId: string): Promise<void> {
    const job = await this.jobsRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) return;

    const [err] = await tryRun(async () => {
      const companyName = job.company?.name ?? null;
      /** Align with match-analysis: prefer captured HTML posting body when present. */
      const descPlain = job.description?.trim() ? tipTapToPlainText(job.description).trim() : "";
      const trimmedHtml = job.htmlContent?.trim() ?? "";
      const htmlPlain = trimmedHtml ? htmlToPlainText(trimmedHtml).trim() : "";
      const bodyPlain = htmlPlain ? htmlPlain : descPlain.trim() ? descPlain : null;

      const notes = await this.notesRepo.find({ where: { jobId, userId }, order: { createdAt: "DESC", id: "DESC" } });
      const notesPlain = notes
        .map((n) => tipTapToPlainText(n.content))
        .filter(Boolean)
        .join("\n---\n");

      const stageEvents = await this.stageEventsRepo
        .createQueryBuilder("e")
        .where("e.job_id = :jobId AND e.user_id = :userId", { jobId, userId })
        .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
        .addOrderBy("e.created_at", "DESC")
        .addOrderBy("e.id", "DESC")
        .getMany();

      const stagesText = stageEvents
        .map((e) => `${e.toStage ?? "unknown"}${e.reason ? `: ${e.reason}` : ""}`)
        .join(" → ");

      const currentStage = stageEvents[0]?.toStage ?? ApplicationStageEnum.New;
      const salaryParts = [
        job.salary?.minCents != null ? `$${(job.salary.minCents / 100).toLocaleString()}` : null,
        job.salary?.maxCents != null ? `$${(job.salary.maxCents / 100).toLocaleString()}` : null,
        job.salary?.currency ?? null,
        job.salary?.period ?? null,
      ].filter(Boolean);
      const salaryText = salaryParts.length > 0 ? salaryParts.join(" ") : null;

      const context = [
        ...(job.title?.trim() ? [`Title: ${job.title.trim()}`] : ["Title: —"]),
        companyName ? `Company: ${companyName}` : null,
        `Current stage: ${currentStage}`,
        bodyPlain ? `Description:\n${bodyPlain}` : null,
        `Tags: ${(job.tags ?? []).join(", ")}`,
        job.location ? `Location: ${job.location}` : null,
        job.workRegion ? `Work Region: ${job.workRegion}` : null,
        job.source ? `Source: ${job.source}` : null,
        salaryText ? `Salary: ${salaryText}` : null,
        stagesText ? `Stage timeline: ${stagesText}` : null,
        notesPlain ? `Notes:\n${notesPlain}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const plainText = await this.summaryAiService.generateSummary(userId, context);
      const tipTapJson = markdownToTipTap(plainText);

      const ok = await this.jobsRepo.updateSummaryMetadataIfStatus(jobId, userId, AsyncMetadataStatusEnum.Processing, {
        status: AsyncMetadataStatusEnum.Completed,
        timestamp: new Date(),
        error: undefined,
      });
      if (!ok) {
        this.logger.warn(`[${jobId}] Race — summary already transitioned`);
        return;
      }

      await this.jobsRepo.updateSummary(jobId, tipTapJson, userId);

      this.eventBus.emit(new SummaryStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Completed));
    });

    if (err) {
      this.logger.error(`Failed to generate summary for ${jobId}`, err instanceof Error ? err.stack : String(err));
      await this.jobsRepo.updateSummaryMetadataIfStatus(jobId, userId, AsyncMetadataStatusEnum.Processing, {
        status: AsyncMetadataStatusEnum.Failed,
      });

      this.eventBus.emit(new SummaryStatusChanged(jobId, userId, AsyncMetadataStatusEnum.Failed));
    }
  }
}
