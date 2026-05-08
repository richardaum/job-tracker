import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportRunType } from "@api/domains/imports/import-run.type";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { resolveImporter } from "@api/domains/imports/importers.registry";
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

  async listImportRuns(userId: string): Promise<ImportRunType[]> {
    const rows = await this.repo.listByUserId(userId);
    return rows.map((row) => this.toGql(row));
  }

  async createImportRun(
    userId: string,
    importerId: string,
  ): Promise<ImportRunType> {
    const resolved = resolveImporter(importerId);
    if (!resolved) {
      throw new BadRequestException(`Unknown importer: ${importerId}`);
    }
    const startedAt = new Date();
    const importerKey = importerId.trim().toLowerCase();

    const row = await this.repo.create({
      userId,
      importerId: importerKey,
      importerName: resolved.name,
      entryUrl: resolved.entryUrl,
      status: ImportRunStatusEnum.RUNNING,
      startedAt,
    });

    const run = this.toGql(row);
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

  async deleteImportRun(userId: string, id: string): Promise<void> {
    const deleted = await this.repo.deleteByUser({ id, userId });
    if (!deleted) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
  }

  async clearImportRuns(userId: string): Promise<void> {
    await this.repo.deleteAllByUserId(userId);
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

  /**
   * Attempts to atomically claim a RUNNING import run for execution.
   * Returns the claimed run on success, or null on normal contention (already
   * claimed, wrong status, or run does not belong to user). Never throws on
   * normal contention so callers can race safely.
   */
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

  async *importRunEvents(userId: string): AsyncIterable<ImportRunEvent> {
    for await (const event of this.eventsPublisher.subscribe()) {
      if (event.userId !== userId) {
        continue;
      }
      yield event.payload;
    }
  }

  private toGql(row: ImportRunEntity): ImportRunType {
    return {
      id: row.id,
      importerId: row.importerId,
      importerName: row.importerName,
      entryUrl: row.entryUrl,
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
