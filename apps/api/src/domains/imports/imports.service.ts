import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportTemplateEntity } from "@api/database/entities/import-template.entity";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { ImportRunType } from "@api/domains/imports/import-run.type";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { ImportTemplateType } from "@api/domains/imports/import-template.type";
import { entryUrlFromExecutorPlan } from "@api/domains/imports/importer-plans";
import { PlanRegistryService } from "@api/domains/imports/plan-registry.service";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";

import { ImportRunEvent } from "./import-run-event.type";
import { ImportRunEventTypeEnum } from "./import-run-event-type.enum";
import { ImportsRepository } from "./imports.repository";
import {
  IMPORTS_EVENTS_PUBLISHER,
  ImportsEventsPublisher,
} from "./imports-events.publisher";

/**
 * Each streamed subscription execution uses this object as graphql `rootValue`
 * so the default resolver can read {@link ImportRunEventsSubscriptionRoot.importRunEvents}.
 */
export type ImportRunEventsSubscriptionRoot = {
  importRunEvents: ImportRunEvent;
};

function extensionMayTransitionStatus(
  from: ImportRunStatusEnum,
  to: ImportRunStatusEnum,
): boolean {
  if (from === to) {
    return true;
  }
  if (
    from === ImportRunStatusEnum.RUNNING &&
    to === ImportRunStatusEnum.IN_PROGRESS
  ) {
    return true;
  }
  if (
    from === ImportRunStatusEnum.IN_PROGRESS &&
    (to === ImportRunStatusEnum.COMPLETED || to === ImportRunStatusEnum.FAILED)
  ) {
    return true;
  }
  if (
    from === ImportRunStatusEnum.RUNNING &&
    to === ImportRunStatusEnum.FAILED
  ) {
    return true;
  }
  return false;
}

@Injectable()
export class ImportsService implements OnModuleInit {
  private static readonly STALE_IN_PROGRESS_TIMEOUT_MS = 10 * 60 * 1000;
  private readonly logger = new Logger(ImportsService.name);

  constructor(
    private readonly repo: ImportsRepository,
    private readonly planRegistry: PlanRegistryService,
    private readonly applicationRepo: ApplicationRepository,
    @Inject(IMPORTS_EVENTS_PUBLISHER)
    private readonly eventsPublisher: ImportsEventsPublisher,
  ) {}

  async onModuleInit(): Promise<void> {
    const recovered = await this.repo.resetStaleInProgressRuns(
      this.getStaleCutoff(new Date()),
    );
    if (recovered > 0) {
      this.logger.warn(
        `Recovered ${recovered} stale import run(s) back to running`,
      );
    }
  }

  async listImportTemplates(userId: string): Promise<ImportTemplateType[]> {
    const templates = await this.repo.listTemplatesByUserId(userId);
    return Promise.all(templates.map((t) => this.templateToGql(t, userId)));
  }

  async listImportTemplatesForImporter(
    userId: string,
    importerId: string,
  ): Promise<ImportTemplateType[]> {
    const importerKey = this.planRegistry.normalizeImporterKey(importerId);
    const templates = await this.repo.listTemplatesByUserAndImporterId({
      userId,
      importerId: importerKey,
    });
    return Promise.all(templates.map((t) => this.templateToGql(t, userId)));
  }

  async listImportRuns(userId: string): Promise<ImportRunType[]> {
    const rows = await this.repo.listByUserId(userId);
    return rows.map((row) => this.toGql(row));
  }

  /**
   * Ensures at most one template per (user, importer); reuses an existing row
   * and only inserts on first use (see DB unique on import_templates).
   */
  async createImportTemplate(
    userId: string,
    input: { importerId: string; surfaceUrl: string },
  ): Promise<ImportTemplateType> {
    const importerKey = this.planRegistry.normalizeImporterKey(
      input.importerId,
    );
    if (this.planRegistry.plan(importerKey) === undefined) {
      throw new BadRequestException(`Unknown importer: ${input.importerId}`);
    }
    const template = await this.repo.findOrCreateTemplate({
      userId,
      importerId: importerKey,
      surfaceUrl: input.surfaceUrl,
    });
    return this.templateToGql(template, userId);
  }

  async createImportRun(
    userId: string,
    importerId: string,
  ): Promise<ImportRunType> {
    const importerKey = this.planRegistry.normalizeImporterKey(importerId);
    const planDoc = this.planRegistry.plan(importerKey);
    if (planDoc === undefined) {
      throw new BadRequestException(`Unknown importer: ${importerId}`);
    }

    const defaultSurfaceUrl = entryUrlFromExecutorPlan(planDoc);
    if (!defaultSurfaceUrl) {
      throw new BadRequestException(
        `Importer ${importerId} has no default surfaceUrl`,
      );
    }

    const template = await this.repo.findOrCreateTemplate({
      userId,
      importerId: importerKey,
      surfaceUrl: defaultSurfaceUrl,
    });

    const startedAt = new Date();
    const surfaceUrl = template.surfaceUrl.trim();

    const row = await this.repo.createRun({
      userId,
      templateId: template.id,
      status: ImportRunStatusEnum.RUNNING,
      startedAt,
      surfaceUrl,
    });

    const loaded =
      (await this.repo.findByUserAndId({ id: row.id, userId })) ?? row;
    const run = this.toGql(loaded);
    await this.eventsPublisher.publish({
      userId,
      payload: {
        type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
        occurredAt: new Date(),
        run,
      },
    });

    return run;
  }

  async rerunImportTemplate(
    userId: string,
    templateId: string,
  ): Promise<ImportRunType> {
    const template = await this.repo.findTemplateByUserAndId({
      userId,
      id: templateId,
    });
    if (!template) {
      throw new NotFoundException(`Import template ${templateId} not found`);
    }
    const planDoc = this.planRegistry.plan(template.importerId);
    if (planDoc === undefined) {
      throw new BadRequestException(`Unknown importer: ${template.importerId}`);
    }
    const startedAt = new Date();
    const surfaceUrl = template.surfaceUrl.trim();

    const row = await this.repo.createRun({
      userId,
      templateId,
      status: ImportRunStatusEnum.RUNNING,
      startedAt,
      surfaceUrl,
    });

    const loaded =
      (await this.repo.findByUserAndId({ id: row.id, userId })) ?? row;
    const run = this.toGql(loaded);
    await this.eventsPublisher.publish({
      userId,
      payload: {
        type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
        occurredAt: new Date(),
        run,
      },
    });

    return run;
  }

  async updateImportTemplate(
    userId: string,
    templateId: string,
    patch: {
      scheduleCron?: string | null;
      scheduleEnabled?: boolean | null;
      surfaceUrl?: string;
    },
  ): Promise<ImportTemplateType> {
    const updated = await this.repo.patchImportTemplate({
      userId,
      id: templateId,
      patch: {
        scheduleCron: patch.scheduleCron,
        scheduleEnabled: patch.scheduleEnabled,
        surfaceUrl: patch.surfaceUrl,
      },
    });
    if (!updated) {
      throw new NotFoundException(`Import template ${templateId} not found`);
    }
    return this.templateToGql(updated, userId);
  }

  async deleteImportTemplate(
    userId: string,
    templateId: string,
  ): Promise<void> {
    const deleted = await this.repo.deleteTemplateForUser({
      userId,
      id: templateId,
    });
    if (!deleted) {
      throw new NotFoundException(`Import template ${templateId} not found`);
    }
  }

  async updateImportRunSurfaceUrl(
    userId: string,
    id: string,
    surfaceUrl: string,
  ): Promise<ImportRunType> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
    const trimmed = surfaceUrl.trim();
    if (trimmed === "") {
      throw new BadRequestException("surfaceUrl cannot be empty");
    }

    await this.repo.updateRunSurfaceUrl({ id, userId, surfaceUrl: trimmed });

    const nextRow = await this.repo.findByUserAndId({ id, userId });
    if (!nextRow) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
    return this.toGql(nextRow);
  }

  async detachApplicationsFromImportRun(
    userId: string,
    importRunId: string,
  ): Promise<number> {
    const row = await this.repo.findByUserAndId({ id: importRunId, userId });
    if (!row) {
      throw new NotFoundException(`Import run ${importRunId} not found`);
    }

    return this.applicationRepo.detachApplicationsImportRun(
      importRunId,
      userId,
    );
  }

  async deleteImportRun(userId: string, id: string): Promise<void> {
    const deleted = await this.repo.deleteByUser({ id, userId });
    if (!deleted) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
  }

  async clearImportRuns(userId: string): Promise<void> {
    await this.repo.deleteTemplatesByUserId(userId);
  }

  async updateImportRunStatus(
    userId: string,
    id: string,
    status: ImportRunStatusEnum,
  ): Promise<ImportRunType> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
    if (!extensionMayTransitionStatus(row.status, status)) {
      throw new BadRequestException(
        `Invalid import run transition: ${row.status} -> ${status}`,
      );
    }
    if (row.status === status) {
      return this.toGql(row);
    }

    await this.repo.updateStatus({ id, userId, status });

    const next = await this.repo.findByUserAndId({ id, userId });
    if (!next) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
    return this.toGql(next);
  }

  async claimImportRun(
    userId: string,
    id: string,
  ): Promise<ImportRunType | null> {
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
      row.status === ImportRunStatusEnum.IN_PROGRESS &&
      this.isStaleInProgress(row.startedAt, now)
    ) {
      await this.repo.updateStatus({
        id,
        userId,
        status: ImportRunStatusEnum.RUNNING,
      });
      const reclaimed = await this.repo.claimRunning({ id, userId });
      if (reclaimed) {
        return this.toGql(reclaimed);
      }
    } else if (row.status !== ImportRunStatusEnum.RUNNING) {
      return null;
    }

    return null;
  }

  async *importRunEvents(
    userId: string,
  ): AsyncIterable<ImportRunEventsSubscriptionRoot> {
    for await (const event of this.eventsPublisher.subscribe()) {
      if (event.userId !== userId) {
        continue;
      }
      yield { importRunEvents: event.payload };
    }
  }

  private async templateToGql(
    template: ImportTemplateEntity,
    userId: string,
  ): Promise<ImportTemplateType> {
    const runs = await this.repo.findRunsForTemplate({
      userId,
      templateId: template.id,
    });
    return {
      id: template.id,
      importerId: template.importerId,
      scheduleCron: template.scheduleCron,
      scheduleEnabled: template.scheduleEnabled,
      surfaceUrl: template.surfaceUrl,
      createdAt: template.createdAt,
      runs: runs.map((r) => this.toGql(r)),
    };
  }

  private toGql(row: ImportRunEntity): ImportRunType {
    const importerId = row.template?.importerId;
    if (!importerId) {
      throw new Error(
        `Import run ${row.id} missing template relation (importerId)`,
      );
    }
    return {
      id: row.id,
      templateId: row.templateId,
      importerId,
      surfaceUrl: row.surfaceUrl,
      status: row.status,
      startedAt: row.startedAt,
      importerSource: "database",
    };
  }

  private getStaleCutoff(now: Date): Date {
    return new Date(
      now.getTime() - ImportsService.STALE_IN_PROGRESS_TIMEOUT_MS,
    );
  }

  private isStaleInProgress(startedAt: Date, now: Date): boolean {
    return startedAt.getTime() < this.getStaleCutoff(now).getTime();
  }
}
