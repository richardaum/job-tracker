import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { JobEntity } from "@api/database/entities/job.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager } from "typeorm";
import { Repository } from "typeorm";

export type AsyncMetadataColumn = "fill" | "summary";

type AsyncMetadataColumnConfig = {
  metadataField: "fillMetadata" | "summaryMetadata";
  statusColumn: "fill_status" | "summary_status";
};

@Injectable()
export class JobAsyncMetadataRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepo: Repository<JobEntity>,
  ) {}

  private columnConfig(column: AsyncMetadataColumn): AsyncMetadataColumnConfig {
    return column === "fill"
      ? { metadataField: "fillMetadata", statusColumn: "fill_status" }
      : { metadataField: "summaryMetadata", statusColumn: "summary_status" };
  }

  /**
   * Atomic JSONB update when `{column}_status` matches {@link expectedStatus} (CAS).
   * Returns whether at least one row was updated.
   */
  async updateCas(
    column: AsyncMetadataColumn,
    jobId: string,
    userId: string,
    expectedStatus: Pick<AsyncMetadataEmbedded, "status"> | null,
    patch: Partial<AsyncMetadataEmbedded> & {
      status: AsyncMetadataEmbedded["status"];
    },
    manager?: EntityManager,
  ): Promise<boolean> {
    const { metadataField, statusColumn } = this.columnConfig(column);
    const metadataUpdate: Partial<AsyncMetadataEmbedded> = {
      status: patch.status,
    };
    if (patch.error !== undefined) {
      metadataUpdate.error = patch.error;
    }
    if (patch.timestamp !== undefined) {
      metadataUpdate.timestamp = patch.timestamp;
    }

    const qb = (manager ?? this.jobsRepo.manager)
      .createQueryBuilder()
      .update(JobEntity)
      .set({ [metadataField]: metadataUpdate })
      .where(`"id" = :id AND "user_id" = :userId`, { id: jobId, userId });

    if (expectedStatus === null) {
      qb.andWhere(`"${statusColumn}" IS NULL`);
    } else {
      qb.andWhere(`"${statusColumn}" = :expected`, {
        expected: expectedStatus.status,
      });
    }

    const result = await qb.execute();
    return (result.affected ?? 0) > 0;
  }

  /**
   * Starts automatic fill (`fill_*` → PROCESSING) only when the row is not already PROCESSING:
   * `fill_status` is NULL ("idle"), FAILED, or COMPLETED (allows re-trigger per PRD).
   */
  async beginFillAutomaticallyProcessing(
    jobId: string,
    userId: string,
  ): Promise<boolean> {
    const now = new Date();
    const fillUpdate: Partial<AsyncMetadataEmbedded> = {
      status: AsyncMetadataStatusEnum.PROCESSING,
      error: null,
      timestamp: now,
    };

    const qb = this.jobsRepo
      .createQueryBuilder()
      .update(JobEntity)
      .set({ fillMetadata: fillUpdate })
      .where(`"id" = :id AND "user_id" = :userId`, { id: jobId, userId })
      .andWhere(
        `("fill_status" IS NULL OR "fill_status" IN (:...restartableStatuses))`,
        {
          restartableStatuses: [
            AsyncMetadataStatusEnum.FAILED,
            AsyncMetadataStatusEnum.COMPLETED,
          ],
        },
      );

    const result = await qb.execute();
    return (result.affected ?? 0) > 0;
  }

  async resetStaleSummaryProcessing(): Promise<number> {
    const result = await this.jobsRepo
      .createQueryBuilder()
      .update()
      .set({
        summaryMetadata: {
          status: AsyncMetadataStatusEnum.FAILED,
          error: "Server restart",
        },
      })
      .where(`"summary_status" = :processing`, {
        processing: AsyncMetadataStatusEnum.PROCESSING,
      })
      .execute();
    return result.affected ?? 0;
  }

  async resetStaleFillProcessing(): Promise<number> {
    const result = await this.jobsRepo
      .createQueryBuilder()
      .update()
      .set({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.FAILED,
          error: "Server restart — fill interrupted",
        },
      })
      .where(`"fill_status" = :processing`, {
        processing: AsyncMetadataStatusEnum.PROCESSING,
      })
      .execute();
    return result.affected ?? 0;
  }
}
