import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import {
  SummaryGenerationRequested,
  SummaryStatusChanged,
} from "@api/domains/applications/application.events";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { ApplicationStageEnum } from "@api/domains/applications/application-stage.enum";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { markdownToTipTap, tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SummaryAiService } from "./summary-ai.service";

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly summaryAiService: SummaryAiService,
    private readonly eventBus: ApplicationEventBus,
    private readonly appRepo: ApplicationRepository,
    @InjectRepository(ApplicationStageEventEntity)
    private readonly stageEventsRepo: Repository<ApplicationStageEventEntity>,
    @InjectRepository(ApplicationNoteEntity)
    private readonly notesRepo: Repository<ApplicationNoteEntity>,
  ) {}

  async generateSummary(applicationId: string, userId: string): Promise<void> {
    const app = await this.appRepo.findOneByIdAndUserId(applicationId, userId);
    if (!app) {
      this.logger.warn(`Application ${applicationId} not found, skipping`);
      return;
    }

    if (app.summaryMetadata?.status === AsyncMetadataStatusEnum.PROCESSING)
      return;

    const ok = await this.appRepo.updateSummaryMetadata(
      applicationId,
      app.summaryMetadata?.status
        ? { status: app.summaryMetadata.status }
        : null,
      { status: AsyncMetadataStatusEnum.PROCESSING },
      userId,
    );
    if (!ok) return;

    this.eventBus.emit(
      new SummaryStatusChanged(
        applicationId,
        userId,
        AsyncMetadataStatusEnum.PROCESSING,
      ),
    );

    this.eventBus.emit(new SummaryGenerationRequested(applicationId, userId));
  }

  async generateSummarySync(
    applicationId: string,
    userId: string,
  ): Promise<void> {
    const app = await this.appRepo.findOneByIdAndUserId(applicationId, userId);
    if (!app) return;

    if (app.summaryMetadata?.status === AsyncMetadataStatusEnum.PROCESSING)
      return;

    const ok = await this.appRepo.updateSummaryMetadata(
      applicationId,
      app.summaryMetadata?.status
        ? { status: app.summaryMetadata.status }
        : null,
      { status: AsyncMetadataStatusEnum.PROCESSING },
      userId,
    );
    if (!ok) return;

    this.eventBus.emit(
      new SummaryStatusChanged(
        applicationId,
        userId,
        AsyncMetadataStatusEnum.PROCESSING,
      ),
    );

    this.eventBus.emit(new SummaryGenerationRequested(applicationId, userId));
  }

  async doGenerate(applicationId: string, userId: string): Promise<void> {
    const app = await this.appRepo.findOneByIdAndUserId(applicationId, userId);
    if (!app) return;

    const [err] = await tryRun(async () => {
      const companyName = app.company?.name ?? null;
      const descPlain = app.description
        ? tipTapToPlainText(app.description)
        : null;

      const notes = await this.notesRepo.find({
        where: { applicationId, userId },
        order: { createdAt: "DESC", id: "DESC" },
      });
      const notesPlain = notes
        .map((n) => tipTapToPlainText(n.content))
        .filter(Boolean)
        .join("\n---\n");

      const stageEvents = await this.stageEventsRepo
        .createQueryBuilder("e")
        .where("e.application_id = :applicationId AND e.user_id = :userId", {
          applicationId,
          userId,
        })
        .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
        .addOrderBy("e.created_at", "DESC")
        .getMany();

      const stagesText = stageEvents
        .map(
          (e) => `${e.toStage ?? "unknown"}${e.reason ? `: ${e.reason}` : ""}`,
        )
        .join(" → ");

      const currentStage = stageEvents[0]?.toStage ?? ApplicationStageEnum.NEW;
      const salaryParts = [
        app.salaryMinCents != null
          ? `$${(app.salaryMinCents / 100).toLocaleString()}`
          : null,
        app.salaryMaxCents != null
          ? `$${(app.salaryMaxCents / 100).toLocaleString()}`
          : null,
        app.salaryCurrency ?? null,
        app.salaryPeriod ?? null,
      ].filter(Boolean);
      const salaryText = salaryParts.length > 0 ? salaryParts.join(" ") : null;

      const context = [
        `Title: ${app.title}`,
        companyName ? `Company: ${companyName}` : null,
        `Current stage: ${currentStage}`,
        descPlain ? `Description:\n${descPlain}` : null,
        `Tags: ${(app.tags ?? []).join(", ")}`,
        app.location ? `Location: ${app.location}` : null,
        app.workRegion ? `Work Region: ${app.workRegion}` : null,
        app.source ? `Source: ${app.source}` : null,
        salaryText ? `Salary: ${salaryText}` : null,
        stagesText ? `Stage timeline: ${stagesText}` : null,
        notesPlain ? `Notes:\n${notesPlain}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const plainText = await this.summaryAiService.generateSummary(context);
      const tipTapJson = markdownToTipTap(plainText);

      const ok = await this.appRepo.updateSummaryMetadata(
        applicationId,
        { status: AsyncMetadataStatusEnum.PROCESSING },
        {
          status: AsyncMetadataStatusEnum.COMPLETED,
          generatedAt: new Date().toISOString(),
          error: undefined,
        },
        userId,
      );
      if (!ok) {
        this.logger.warn(
          `[${applicationId}] Race — summary already transitioned`,
        );
        return;
      }

      await this.appRepo.updateSummary(applicationId, tipTapJson, userId);

      this.eventBus.emit(
        new SummaryStatusChanged(
          applicationId,
          userId,
          AsyncMetadataStatusEnum.COMPLETED,
        ),
      );
    });

    if (err) {
      this.logger.error(
        `Failed to generate summary for ${applicationId}`,
        err instanceof Error ? err.message : String(err),
      );
      await this.appRepo.updateSummaryMetadata(
        applicationId,
        { status: AsyncMetadataStatusEnum.PROCESSING },
        {
          status: AsyncMetadataStatusEnum.FAILED,
          error: err instanceof Error ? err.message : "Unknown error",
        },
        userId,
      );

      this.eventBus.emit(
        new SummaryStatusChanged(
          applicationId,
          userId,
          AsyncMetadataStatusEnum.FAILED,
        ),
      );
    }
  }
}
