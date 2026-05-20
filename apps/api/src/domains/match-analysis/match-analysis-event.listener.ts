import { JobCreated } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { ResumeRepository } from "@api/domains/resumes/resumes.repository";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { MatchAnalysisRequested } from "./match-analysis.events";
import { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";

@Injectable()
export class MatchAnalysisEventListener implements OnModuleInit {
  private readonly logger = new Logger(MatchAnalysisEventListener.name);

  constructor(
    private readonly eventBus: JobEventBus,
    private readonly matchEventBus: MatchAnalysisEventBus,
    private readonly jobRepo: JobsRepository,
    private readonly resumeRepo: ResumeRepository,
    private readonly matchService: MatchAnalysisService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(JobCreated, (event) => {
      void this.handleJobCreated(event);
    });

    this.matchEventBus.on(MatchAnalysisRequested, (event) => {
      void this.handleMatchAnalysisRequested(event);
    });

    this.logger.log(
      "Listening for job.created and match.analysis.requested events",
    );
  }

  private async handleJobCreated(event: JobCreated): Promise<void> {
    const { jobId, userId } = event;

    const [appErr, job] = await tryRun(
      this.jobRepo.findOneByIdAndUserId(jobId, userId),
    );
    if (appErr || !job) {
      this.logger.warn(
        `[AutoMatch] Job ${jobId} not found or error: ${appErr?.message}`,
      );
      return;
    }

    if (!job.description?.trim()) {
      this.logger.log(`[AutoMatch] Skipping job ${jobId}: no job description`);
      return;
    }

    const defaultResume = await this.resumeRepo.findDefaultByUserId(userId);
    if (!defaultResume) {
      this.logger.log(
        `[AutoMatch] Skipping job ${jobId}: no default resume for user ${userId}`,
      );
      return;
    }

    const [err] = await tryRun(
      this.matchService.generate(jobId, defaultResume.id, userId),
    );

    if (err) {
      this.logger.error(
        `[AutoMatch] Failed to trigger match for job ${jobId}: ${err.message}`,
      );
    } else {
      this.logger.log(
        `[AutoMatch] Queued match analysis for job ${jobId} (resume: ${defaultResume.id})`,
      );
    }
  }

  private async handleMatchAnalysisRequested(
    event: MatchAnalysisRequested,
  ): Promise<void> {
    await this.matchService.processMatchAnalysis(
      event.matchId,
      event.userId,
      event.source,
    );
  }
}
