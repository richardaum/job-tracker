import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportRunType } from "@api/domains/imports/import-run.type";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { resolveImporter } from "@api/domains/imports/importers.registry";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ImportRunEvent } from "./import-run-event.type";
import { ImportsRepository } from "./imports.repository";

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
export class ImportsService {
  constructor(private readonly repo: ImportsRepository) {}

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

    return this.toGql(row);
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

  async claimImportRun(
    userId: string,
    id: string,
  ): Promise<ImportRunType | null> {
    const row = await this.repo.findByUserAndId({ id, userId });
    if (!row) {
      throw new NotFoundException(`Import run ${id} not found`);
    }
    if (row.status !== ImportRunStatusEnum.RUNNING) {
      return null;
    }

    await this.repo.updateStatus({
      id,
      userId,
      status: ImportRunStatusEnum.IN_PROGRESS,
    });

    const next = await this.repo.findByUserAndId({ id, userId });
    if (!next || next.status !== ImportRunStatusEnum.IN_PROGRESS) {
      return null;
    }

    return this.toGql(next);
  }

  importRunEvents(_userId: string): AsyncIterable<ImportRunEvent> {
    return {
      [Symbol.asyncIterator](): AsyncIterator<ImportRunEvent> {
        return {
          async next(): Promise<IteratorResult<ImportRunEvent>> {
            return new Promise<IteratorResult<ImportRunEvent>>(() => {});
          },
        };
      },
    };
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
}
