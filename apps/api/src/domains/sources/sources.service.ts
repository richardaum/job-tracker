import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { SourceRunActivityEvent } from "@api/domains/sources/source-run-activity-event.type";
import { SourceRunType } from "@api/domains/sources/source-run.type";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { StopWhenEnum } from "@api/domains/sources/stop-when.enum";
import { SourceTemplateType } from "@api/domains/sources/source-template.type";
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";

import { PlanService } from "./plan.service";
import { SourceRunEventTypeEnum } from "./source-run-event-type.enum";
import { SourceRunReported } from "./sources.events";
import { SourcesRepository } from "./sources.repository";
import { SourcesEventBus } from "./sources-event.bus";
import { planHasPublishedAt, SourceTemplateConfigSchema } from "./source-template-config.schema";

function extensionMayTransitionStatus(from: SourceRunStatusEnum, to: SourceRunStatusEnum): boolean {
  if (from === to) {
    return true;
  }
  if (
    from === SourceRunStatusEnum.Pending &&
    (to === SourceRunStatusEnum.Completed || to === SourceRunStatusEnum.Failed)
  ) {
    return true;
  }
  return false;
}

@Injectable()
export class SourcesService implements OnModuleInit {
  private static readonly STALE_TIMEOUT_MS = 10 * 60 * 1000;
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    private readonly repo: SourcesRepository,
    private readonly planService: PlanService,
    private readonly jobRepo: JobsRepository,
    private readonly eventBus: SourcesEventBus,
  ) {}

  async onModuleInit(): Promise<void> {
    const stale = await this.repo.countStalePending(this.getStaleCutoff(new Date()));
    if (stale > 0) {
      this.logger.warn(`Found ${stale} stale pending source run(s) that were never processed`);
    }
  }

  async listSourceTemplates(userId: string): Promise<SourceTemplateType[]> {
    const templates = await this.repo.listTemplatesByUserId(userId);
    return Promise.all(templates.map((t) => this.templateToGql(t)));
  }

  async listTemplatesForPlan(userId: string, planId: string): Promise<SourceTemplateType[]> {
    const templates = await this.repo.listTemplatesByUserAndPlanId(userId, planId);
    return Promise.all(templates.map((t) => this.templateToGql(t)));
  }

  async getSourceTemplate(userId: string, id: string): Promise<SourceTemplateType> {
    const template = await this.repo.findTemplateByUserAndId({ userId, id });
    if (!template) {
      throw new NotFoundException(`Source template ${id} not found`);
    }
    return this.templateToGql(template);
  }

  async listSourceRuns(userId: string): Promise<SourceRunType[]> {
    const rows = await this.repo.listByUserId(userId);
    return rows.map((row) => this.toGql(row));
  }

  async createSourceTemplate(
    userId: string,
    input: { planId: string; surfaceUrl: string; config?: Record<string, unknown> | null },
  ): Promise<SourceTemplateType> {
    const plan = await this.planService.findById(input.planId);
    if (input.config !== undefined && input.config !== null) {
      this.validateConfig(input.config, plan.document as Record<string, unknown>);
    }
    const template = await this.repo.findOrCreateTemplate({
      userId,
      planId: plan.id,
      surfaceUrl: input.surfaceUrl,
      config: input.config ?? undefined,
    });
    return this.templateToGql(template);
  }

  async createSourceRun(userId: string, planId: string): Promise<SourceRunType> {
    const plan = await this.planService.findById(planId);

    const template = await this.repo.findTemplateByUserAndPlanId({ userId, planId: plan.id });
    if (!template) {
      throw new BadRequestException(`No source template for plan ${planId}. Create one first.`);
    }

    const startedAt = new Date();
    const surfaceUrl = template.surfaceUrl.trim();

    const row = await this.repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.Pending,
      startedAt,
      surfaceUrl,
    });

    const loaded = (await this.repo.findByUserAndId({ id: row.id, userId })) ?? row;
    const run = this.toGql(loaded);
    this.eventBus.emit(
      new SourceRunReported(userId, { type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED, occurredAt: new Date(), run }),
    );

    return run;
  }

  async rerunSourceTemplate(userId: string, templateId: string): Promise<SourceRunType> {
    const template = await this.repo.findTemplateByUserAndId({ userId, id: templateId });
    if (!template) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }

    if (!template.plan) {
      throw new BadRequestException(`Template ${templateId} has no associated plan`);
    }

    const startedAt = new Date();
    const surfaceUrl = template.surfaceUrl.trim();

    const row = await this.repo.createRun({
      userId,
      templateId,
      status: SourceRunStatusEnum.Pending,
      startedAt,
      surfaceUrl,
    });

    const loaded = (await this.repo.findByUserAndId({ id: row.id, userId })) ?? row;
    const run = this.toGql(loaded);
    this.eventBus.emit(
      new SourceRunReported(userId, { type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED, occurredAt: new Date(), run }),
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
      config?: Record<string, unknown> | null;
    },
  ): Promise<SourceTemplateType> {
    if (patch.config !== undefined && patch.config !== null) {
      const template = await this.repo.findTemplateByUserAndId({ userId, id: templateId });
      if (!template) {
        throw new NotFoundException(`Source template ${templateId} not found`);
      }
      this.validateConfig(patch.config, template.plan.document as Record<string, unknown>);
    }
    const updated = await this.repo.patchSourceTemplate({
      userId,
      id: templateId,
      patch: {
        scheduleCron: patch.scheduleCron,
        scheduleEnabled: patch.scheduleEnabled,
        surfaceUrl: patch.surfaceUrl,
        config: patch.config,
      },
    });
    if (!updated) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }
    return this.templateToGql(updated);
  }

  async deleteSourceTemplate(userId: string, templateId: string): Promise<void> {
    const deleted = await this.repo.deleteTemplateForUser({ userId, id: templateId });
    if (!deleted) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }
  }

  async updateSourceRunSurfaceUrl(userId: string, id: string, surfaceUrl: string): Promise<SourceRunType> {
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

  async detachJobsFromSourceRun(userId: string, sourceRunId: string): Promise<number> {
    const row = await this.repo.findByUserAndId({ id: sourceRunId, userId });
    if (!row) {
      throw new NotFoundException(`Source run ${sourceRunId} not found`);
    }

    return this.jobRepo.detachJobsSourceRun(sourceRunId, userId);
  }

  async deleteSourceRun(userId: string, id: string, options?: { deleteJobs?: boolean }): Promise<void> {
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

  async clearTemplateRuns(userId: string, templateId: string, options?: { deleteJobs?: boolean }): Promise<number> {
    const template = await this.repo.findTemplateByUserAndId({ userId, id: templateId });
    if (!template) {
      throw new NotFoundException(`Source template ${templateId} not found`);
    }

    if (options?.deleteJobs) {
      const runs = await this.repo.findRunsForTemplate({ userId, templateId });
      for (const run of runs) {
        await this.jobRepo.deleteBySourceRunId(run.id, userId);
      }
    }

    const deleted = await this.repo.deleteRunsByTemplateId({ userId, templateId });

    this.logger.log(`Cleared ${deleted} runs for template ${templateId} (user ${userId})`);
    return deleted;
  }

  async updateSourceRunStatus(
    userId: string,
    id: string,
    status: SourceRunStatusEnum,
    errorMessage?: string | null,
  ): Promise<SourceRunType> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Source run ${id} not found`);
    }
    if (!extensionMayTransitionStatus(row.status, status)) {
      throw new BadRequestException(`Invalid source run transition: ${row.status} -> ${status}`);
    }
    if (row.status === status) {
      return this.toGql(row);
    }

    await this.repo.updateStatus({ id, userId, status, errorMessage });

    const next = await this.repo.findByUserAndId({ id, userId });
    if (!next) {
      throw new NotFoundException(`Source run ${id} not found`);
    }

    const run = this.toGql(next);
    this.eventBus.emit(
      new SourceRunReported(userId, {
        type: SourceRunEventTypeEnum.SOURCE_RUN_STATUS_CHANGED,
        occurredAt: new Date(),
        run,
      }),
    );

    return run;
  }

  async listSourceRunActivityEvents(userId: string, runId: string): Promise<SourceRunActivityEvent[]> {
    return this.repo.findActivityEventsByRunId(userId, runId);
  }

  private getStaleCutoff(now: Date): Date {
    return new Date(now.getTime() - SourcesService.STALE_TIMEOUT_MS);
  }

  private async templateToGql(template: SourceTemplateEntity): Promise<SourceTemplateType> {
    const runs = await this.repo.findRunsForTemplate({ userId: template.userId, templateId: template.id });

    const jobCounts = await this.jobRepo.countBySourceRunIds(
      template.userId,
      runs.map((r) => r.id),
    );

    return {
      id: template.id,
      planId: template.planId,
      plan: {
        id: template.plan.id,
        displayName: template.plan.displayName,
        document: template.plan.document,
        createdAt: template.plan.createdAt,
        updatedAt: template.plan.updatedAt,
      },
      scheduleCron: template.scheduleCron,
      scheduleEnabled: template.scheduleEnabled,
      surfaceUrl: template.surfaceUrl,
      config: template.config,
      createdAt: template.createdAt,
      runs: runs.map((r) => this.toGql(r, jobCounts)),
    };
  }

  private validateConfig(config: Record<string, unknown>, planDocument: Record<string, unknown>): void {
    const result = SourceTemplateConfigSchema.safeParse(config);
    if (!result.success) {
      const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new BadRequestException(`Invalid stop config: ${messages.join("; ")}`);
    }

    if (result.data.stopWhen.includes(StopWhenEnum.OlderThan)) {
      if (!planHasPublishedAt(planDocument)) {
        throw new BadRequestException(
          "Stop condition OlderThan requires a surface field with key 'publishedAt' in the plan",
        );
      }
    }
  }

  private toGql(row: SourceRunEntity, jobCounts?: Map<string, number>): SourceRunType {
    const config = row.template?.config as Record<string, unknown> | undefined;

    return {
      id: row.id,
      templateId: row.templateId,
      planId: row.template?.plan?.id ?? "",
      surfaceUrl: row.surfaceUrl,
      status: row.status,
      errorMessage: row.errorMessage ?? null,
      startedAt: row.startedAt,
      stopWhen: Array.isArray(config?.stopWhen)
        ? ((config.stopWhen[0] as StopWhenEnum) ?? null)
        : ((config?.stopWhen as SourceRunType["stopWhen"]) ?? null),
      catchUpThreshold: (config?.catchUpThreshold as SourceRunType["catchUpThreshold"]) ?? null,
      maxPages: (config?.maxPages as SourceRunType["maxPages"]) ?? null,
      olderThanDays: (config?.olderThanDays as SourceRunType["olderThanDays"]) ?? null,
      jobCount: jobCounts?.get(row.id) ?? 0,
    };
  }
}
