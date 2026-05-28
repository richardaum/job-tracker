import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { PlanService } from "@api/domains/sources/plan.service";
import { SourceRunType } from "@api/domains/sources/source-run.type";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { SourceTemplateType } from "@api/domains/sources/source-template.type";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";

import { SourceRunEventTypeEnum } from "./source-run-event-type.enum";
import { SourceRunReported } from "./sources.events";
import { SourcesRepository } from "./sources.repository";
import { SourcesEventBus } from "./sources-event.bus";

function extensionMayTransitionStatus(
  from: SourceRunStatusEnum,
  to: SourceRunStatusEnum,
): boolean {
  if (from === to) {
    return true;
  }
  if (
    from === SourceRunStatusEnum.RUNNING &&
    to === SourceRunStatusEnum.IN_PROGRESS
  ) {
    return true;
  }
  if (
    from === SourceRunStatusEnum.IN_PROGRESS &&
    (to === SourceRunStatusEnum.COMPLETED || to === SourceRunStatusEnum.FAILED)
  ) {
    return true;
  }
  if (
    from === SourceRunStatusEnum.RUNNING &&
    to === SourceRunStatusEnum.FAILED
  ) {
    return true;
  }
  return false;
}

@Injectable()
export class SourcesService implements OnModuleInit {
  private static readonly STALE_IN_PROGRESS_TIMEOUT_MS = 10 * 60 * 1000;
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    private readonly repo: SourcesRepository,
    private readonly planService: PlanService,
    private readonly jobRepo: JobsRepository,
    private readonly eventBus: SourcesEventBus,
  ) {}

  async onModuleInit(): Promise<void> {
    const recovered = await this.repo.resetStaleInProgressRuns(
      this.getStaleCutoff(new Date()),
    );
    if (recovered > 0) {
      this.logger.warn(
        `Recovered ${recovered} stale source run(s) back to running`,
      );
    }
  }

  async listSourceTemplates(userId: string): Promise<SourceTemplateType[]> {
    const templates = await this.repo.listTemplatesByUserId(userId);
    return Promise.all(templates.map((t) => this.templateToGql(t, userId)));
  }

  async listSourceTemplatesForSourceProfile(
    userId: string,
    sourceProfileId: string,
  ): Promise<SourceTemplateType[]> {
    const sourceProfileKey =
      this.planService.normalizeSourceProfileKey(sourceProfileId);
    const templates = await this.repo.listTemplatesByUserAndSourceProfileId({
      userId,
      sourceProfileId: sourceProfileKey,
    });
    return Promise.all(templates.map((t) => this.templateToGql(t, userId)));
  }

  async getSourceTemplate(
    userId: string,
    id: string,
  ): Promise<SourceTemplateType> {
    const template = await this.repo.findTemplateByUserAndId({ userId, id });
    if (!template) {
      throw new NotFoundException(`Source template ${id} not found`);
    }
    return this.templateToGql(template, userId);
  }

  async listSourceRuns(userId: string): Promise<SourceRunType[]> {
    const rows = await this.repo.listByUserId(userId);
    return rows.map((row) => this.toGql(row));
  }

  /**
   * Ensures at most one template per (user, source profile); reuses an existing row
   * and only inserts on first use (see DB unique on source_templates).
   */
  async createSourceTemplate(
    userId: string,
    input: { sourceProfileId: string; surfaceUrl: string },
  ): Promise<SourceTemplateType> {
    const sourceProfileKey = this.planService.normalizeSourceProfileKey(
      input.sourceProfileId,
    );
    if (
      (await this.planService.findPlanDocument(sourceProfileKey)) === undefined
    ) {
      throw new BadRequestException(
        `Unknown source profile: ${input.sourceProfileId}`,
      );
    }
    const template = await this.repo.findOrCreateTemplate({
      userId,
      sourceProfileId: sourceProfileKey,
      surfaceUrl: input.surfaceUrl,
    });
    return this.templateToGql(template, userId);
  }

  async createSourceRun(
    userId: string,
    sourceProfileId: string,
  ): Promise<SourceRunType> {
    const sourceProfileKey =
      this.planService.normalizeSourceProfileKey(sourceProfileId);
    if (
      (await this.planService.findPlanDocument(sourceProfileKey)) === undefined
    ) {
      throw new BadRequestException(
        `Unknown source profile: ${sourceProfileId}`,
      );
    }

    const template = await this.repo.findTemplateByUserAndSourceProfile({
      userId,
      sourceProfileId: sourceProfileKey,
    });
    if (!template) {
      throw new BadRequestException(
        `No source template for profile ${sourceProfileId}. Create one first.`,
      );
    }

    const startedAt = new Date();
    const surfaceUrl = template.surfaceUrl.trim();

    const row = await this.repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.RUNNING,
      startedAt,
      surfaceUrl,
    });

    const loaded =
      (await this.repo.findByUserAndId({ id: row.id, userId })) ?? row;
    const run = this.toGql(loaded);
    this.eventBus.emit(
      new SourceRunReported(userId, {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        occurredAt: new Date(),
        run,
      }),
    );

    return run;
  }

  async rerunSourceTemplate(
    userId: string,
    templateId: string,
  ): Promise<SourceRunType> {
    const template = await this.repo.findTemplateByUserAndId({
      userId,
      id: templateId,
    });
    if (!template) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }
    const planDoc = await this.planService.findPlanDocument(
      template.sourceProfileId,
    );
    if (planDoc === undefined) {
      throw new BadRequestException(
        `Unknown source profile: ${template.sourceProfileId}`,
      );
    }
    const startedAt = new Date();
    const surfaceUrl = template.surfaceUrl.trim();

    const row = await this.repo.createRun({
      userId,
      templateId,
      status: SourceRunStatusEnum.RUNNING,
      startedAt,
      surfaceUrl,
    });

    const loaded =
      (await this.repo.findByUserAndId({ id: row.id, userId })) ?? row;
    const run = this.toGql(loaded);
    this.eventBus.emit(
      new SourceRunReported(userId, {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        occurredAt: new Date(),
        run,
      }),
    );

    return run;
  }

  async updateSourceTemplate(
    userId: string,
    templateId: string,
    patch: {
      scheduleCron?: string | null;
      scheduleEnabled?: boolean | null;
      surfaceUrl?: string;
    },
  ): Promise<SourceTemplateType> {
    const updated = await this.repo.patchSourceTemplate({
      userId,
      id: templateId,
      patch: {
        scheduleCron: patch.scheduleCron,
        scheduleEnabled: patch.scheduleEnabled,
        surfaceUrl: patch.surfaceUrl,
      },
    });
    if (!updated) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }
    return this.templateToGql(updated, userId);
  }

  async deleteSourceTemplate(
    userId: string,
    templateId: string,
  ): Promise<void> {
    const deleted = await this.repo.deleteTemplateForUser({
      userId,
      id: templateId,
    });
    if (!deleted) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }
  }

  async updateSourceRunSurfaceUrl(
    userId: string,
    id: string,
    surfaceUrl: string,
  ): Promise<SourceRunType> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Source run ${id} not found`);
    }
    const trimmed = surfaceUrl.trim();
    if (trimmed === "") {
      throw new BadRequestException("surfaceUrl cannot be empty");
    }

    await this.repo.updateRunSurfaceUrl({ id, userId, surfaceUrl: trimmed });

    const nextRow = await this.repo.findByUserAndId({ id, userId });
    if (!nextRow) {
      throw new NotFoundException(`Source run ${id} not found`);
    }
    return this.toGql(nextRow);
  }

  async detachJobsFromSourceRun(
    userId: string,
    sourceRunId: string,
  ): Promise<number> {
    const row = await this.repo.findByUserAndId({ id: sourceRunId, userId });
    if (!row) {
      throw new NotFoundException(`Source run ${sourceRunId} not found`);
    }

    return this.jobRepo.detachJobsSourceRun(sourceRunId, userId);
  }

  async deleteSourceRun(
    userId: string,
    id: string,
    options?: { deleteJobs?: boolean },
  ): Promise<void> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Source run ${id} not found`);
    }

    if (options?.deleteJobs) {
      await this.jobRepo.deleteBySourceRunId(id, userId);
    }

    const deleted = await this.repo.deleteByUser({ id, userId });
    if (!deleted) {
      throw new NotFoundException(`Source run ${id} not found`);
    }
  }

  async clearSourceRuns(userId: string): Promise<void> {
    await this.repo.deleteTemplatesByUserId(userId);
  }

  async updateSourceRunStatus(
    userId: string,
    id: string,
    status: SourceRunStatusEnum,
  ): Promise<SourceRunType> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Source run ${id} not found`);
    }
    if (!extensionMayTransitionStatus(row.status, status)) {
      throw new BadRequestException(
        `Invalid source run transition: ${row.status} -> ${status}`,
      );
    }
    if (row.status === status) {
      return this.toGql(row);
    }

    await this.repo.updateStatus({ id, userId, status });

    const next = await this.repo.findByUserAndId({ id, userId });
    if (!next) {
      throw new NotFoundException(`Source run ${id} not found`);
    }
    return this.toGql(next);
  }

  private async templateToGql(
    template: SourceTemplateEntity,
    userId: string,
  ): Promise<SourceTemplateType> {
    const runs = await this.repo.findRunsForTemplate({
      userId,
      templateId: template.id,
    });
    return {
      id: template.id,
      sourceProfileId: template.sourceProfileId,
      scheduleCron: template.scheduleCron,
      scheduleEnabled: template.scheduleEnabled,
      surfaceUrl: template.surfaceUrl,
      createdAt: template.createdAt,
      runs: runs.map((r) => this.toGql(r)),
    };
  }

  private toGql(row: SourceRunEntity): SourceRunType {
    const sourceProfileId = row.template?.sourceProfileId;
    if (!sourceProfileId) {
      throw new Error(
        `Source run ${row.id} missing template relation (sourceProfileId)`,
      );
    }
    return {
      id: row.id,
      templateId: row.templateId,
      sourceProfileId,
      surfaceUrl: row.surfaceUrl,
      status: row.status,
      startedAt: row.startedAt,
      sourceProfile: "database",
    };
  }

  private getStaleCutoff(now: Date): Date {
    return new Date(
      now.getTime() - SourcesService.STALE_IN_PROGRESS_TIMEOUT_MS,
    );
  }
}
