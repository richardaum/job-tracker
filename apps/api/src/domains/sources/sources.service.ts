import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { SourceProfileRegistryService } from "@api/domains/sources/source-profile-registry.service";
import { entryUrlFromExecutorPlan } from "@api/domains/sources/source-profiles";
import { SourceRunType } from "@api/domains/sources/source-run.type";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { SourceTemplateType } from "@api/domains/sources/source-template.type";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";

import { SourceRunEvent } from "./source-run-event.type";
import { SourceRunEventTypeEnum } from "./source-run-event-type.enum";
import { SourcesRepository } from "./sources.repository";
import {
  SOURCES_EVENTS_PUBLISHER,
  SourcesEventsPublisher,
} from "./sources-events.publisher";

/**
 * Each streamed subscription execution uses this object as graphql `rootValue`
 * so the default resolver can read {@link SourceRunEventsSubscriptionRoot.sourceRunEvents}.
 */
export type SourceRunEventsSubscriptionRoot = {
  sourceRunEvents: SourceRunEvent;
};

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
    private readonly sourceProfileRegistry: SourceProfileRegistryService,
    private readonly jobRepo: JobsRepository,
    @Inject(SOURCES_EVENTS_PUBLISHER)
    private readonly eventsPublisher: SourcesEventsPublisher,
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
      this.sourceProfileRegistry.normalizeSourceProfileKey(sourceProfileId);
    const templates = await this.repo.listTemplatesByUserAndSourceProfileId({
      userId,
      sourceProfileId: sourceProfileKey,
    });
    return Promise.all(templates.map((t) => this.templateToGql(t, userId)));
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
    const sourceProfileKey =
      this.sourceProfileRegistry.normalizeSourceProfileKey(
        input.sourceProfileId,
      );
    if (this.sourceProfileRegistry.plan(sourceProfileKey) === undefined) {
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
      this.sourceProfileRegistry.normalizeSourceProfileKey(sourceProfileId);
    const planDoc = this.sourceProfileRegistry.plan(sourceProfileKey);
    if (planDoc === undefined) {
      throw new BadRequestException(
        `Unknown source profile: ${sourceProfileId}`,
      );
    }

    const defaultSurfaceUrl = entryUrlFromExecutorPlan(planDoc);
    if (!defaultSurfaceUrl) {
      throw new BadRequestException(
        `Source profile ${sourceProfileId} has no default surfaceUrl`,
      );
    }

    const template = await this.repo.findOrCreateTemplate({
      userId,
      sourceProfileId: sourceProfileKey,
      surfaceUrl: defaultSurfaceUrl,
    });

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
    await this.eventsPublisher.publish({
      userId,
      payload: {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        occurredAt: new Date(),
        run,
      },
    });

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
    const planDoc = this.sourceProfileRegistry.plan(template.sourceProfileId);
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
    await this.eventsPublisher.publish({
      userId,
      payload: {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        occurredAt: new Date(),
        run,
      },
    });

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

  async deleteSourceRun(userId: string, id: string): Promise<void> {
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

  async claimSourceRun(
    userId: string,
    id: string,
  ): Promise<SourceRunType | null> {
    const claimed = await this.repo.claimRunning({ id, userId });
    if (claimed) {
      return this.toGql(claimed);
    }

    const now = new Date();
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      return null;
    }
    if (
      row.status === SourceRunStatusEnum.IN_PROGRESS &&
      this.isStaleInProgress(row.startedAt, now)
    ) {
      await this.repo.updateStatus({
        id,
        userId,
        status: SourceRunStatusEnum.RUNNING,
      });
      const reclaimed = await this.repo.claimRunning({ id, userId });
      if (reclaimed) {
        return this.toGql(reclaimed);
      }
    } else if (row.status !== SourceRunStatusEnum.RUNNING) {
      return null;
    }

    return null;
  }

  async *sourceRunEvents(
    userId: string,
  ): AsyncIterable<SourceRunEventsSubscriptionRoot> {
    for await (const event of this.eventsPublisher.subscribe()) {
      if (event.userId !== userId) {
        continue;
      }
      yield { sourceRunEvents: event.payload };
    }
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

  private isStaleInProgress(startedAt: Date, now: Date): boolean {
    return startedAt.getTime() < this.getStaleCutoff(now).getTime();
  }
}
