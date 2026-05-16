import { ApplicationCreated } from "@api/domains/applications/application.events";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { ResumeRepository } from "@api/domains/resumes/resumes.repository";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { FitAnalysisRequested } from "./fit-analysis.events";
import { FitAnalysisService } from "./fit-analysis.service";
import { FitAnalysisEventBus } from "./fit-analysis-event.bus";

@Injectable()
export class FitAnalysisEventListener implements OnModuleInit {
  private readonly logger = new Logger(FitAnalysisEventListener.name);

  constructor(
    private readonly eventBus: ApplicationEventBus,
    private readonly fitEventBus: FitAnalysisEventBus,
    private readonly applicationRepo: ApplicationRepository,
    private readonly resumeRepo: ResumeRepository,
    private readonly fitService: FitAnalysisService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(ApplicationCreated, (event) => {
      void this.handleApplicationCreated(event);
    });

    this.fitEventBus.on(FitAnalysisRequested, (event) => {
      void this.handleFitAnalysisRequested(event);
    });

    this.logger.log(
      "Listening for application.created and fit.analysis.requested events",
    );
  }

  private async handleApplicationCreated(
    event: ApplicationCreated,
  ): Promise<void> {
    const { applicationId, userId } = event;

    const [appErr, application] = await tryRun(
      this.applicationRepo.findOneByIdAndUserId(applicationId, userId),
    );
    if (appErr || !application) {
      this.logger.warn(
        `[AutoFit] Application ${applicationId} not found or error: ${appErr?.message}`,
      );
      return;
    }

    if (!application.description?.trim()) {
      this.logger.log(
        `[AutoFit] Skipping application ${applicationId}: no job description`,
      );
      return;
    }

    const defaultResume = await this.resumeRepo.findDefaultByUserId(userId);
    if (!defaultResume) {
      this.logger.log(
        `[AutoFit] Skipping application ${applicationId}: no default resume for user ${userId}`,
      );
      return;
    }

    const [err] = await tryRun(
      this.fitService.generate(applicationId, defaultResume.id, userId),
    );

    if (err) {
      this.logger.error(
        `[AutoFit] Failed to trigger fit for application ${applicationId}: ${err.message}`,
      );
    } else {
      this.logger.log(
        `[AutoFit] Queued fit analysis for application ${applicationId} (resume: ${defaultResume.id})`,
      );
    }
  }

  private async handleFitAnalysisRequested(
    event: FitAnalysisRequested,
  ): Promise<void> {
    await this.fitService.processFitAnalysis(
      event.fitId,
      event.userId,
      event.source,
    );
  }
}
