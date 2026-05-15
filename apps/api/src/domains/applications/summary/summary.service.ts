import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { markdownToTipTap, tipTapToPlainText } from "@job-tracker/tiptap";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SummaryAiService } from "./summary-ai.service";
import { ApplicationSummaryStatus } from "./summary-status.enum";

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly summaryAiService: SummaryAiService,
    private readonly eventBus: ApplicationEventBus,
    @InjectRepository(ApplicationEntity)
    private readonly appRepo: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationStageEventEntity)
    private readonly stageEventsRepo: Repository<ApplicationStageEventEntity>,
    @InjectRepository(ApplicationNoteEntity)
    private readonly notesRepo: Repository<ApplicationNoteEntity>,
  ) {}

  async generateSummary(applicationId: string, userId: string): Promise<void> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId, userId },
      relations: ["company"],
    });
    if (!app) {
      this.logger.warn(`Application ${applicationId} not found, skipping`);
      return;
    }

    if (app.summaryStatus === ApplicationSummaryStatus.PROCESSING) {
      return;
    }

    await this.appRepo.update(
      { id: applicationId, userId },
      {
        summaryStatus: ApplicationSummaryStatus.PROCESSING,
        summaryError: null,
      },
    );

    this.eventBus.emitSummaryStatusChanged(
      applicationId,
      userId,
      ApplicationSummaryStatus.PROCESSING,
    );

    this.eventBus.emitSummaryGenerationRequested(applicationId, userId);
  }

  async generateSummarySync(
    applicationId: string,
    userId: string,
  ): Promise<void> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId, userId },
      relations: ["company"],
    });
    if (!app) return;

    if (app.summaryStatus === ApplicationSummaryStatus.PROCESSING) {
      return;
    }

    await this.appRepo.update(
      { id: applicationId, userId },
      {
        summaryStatus: ApplicationSummaryStatus.PROCESSING,
        summaryError: null,
      },
    );

    this.eventBus.emitSummaryStatusChanged(
      applicationId,
      userId,
      ApplicationSummaryStatus.PROCESSING,
    );

    this.eventBus.emitSummaryGenerationRequested(applicationId, userId);
  }

  async doGenerate(applicationId: string, userId: string): Promise<void> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId, userId },
      relations: ["company"],
    });
    if (!app) return;

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
      .map((e) => `${e.toStage ?? "unknown"}${e.reason ? `: ${e.reason}` : ""}`)
      .join(" → ");

    const currentStage = stageEvents[0]?.toStage ?? "new";
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

    await this.appRepo.update(
      { id: applicationId, userId },
      {
        summary: tipTapJson,
        summaryStatus: ApplicationSummaryStatus.COMPLETED,
        summaryError: null,
        summaryGeneratedAt: new Date(),
      },
    );
  }
}
