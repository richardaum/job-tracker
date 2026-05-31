import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import type { EntityManager, EntityTarget, ObjectLiteral, Repository } from "typeorm";

export type AsyncMetadataColumns = {
  metadataField: string;
  statusColumn: string;
};

export type AsyncMetadataStatusPatch = Partial<AsyncMetadataEmbedded> & {
  status: AsyncMetadataEmbedded["status"];
};

export type AsyncMetadataScopedRow = { id: string; userId: string };

function buildMetadataUpdate(patch: AsyncMetadataStatusPatch): Partial<AsyncMetadataEmbedded> {
  const metadataUpdate: Partial<AsyncMetadataEmbedded> = {
    status: patch.status,
  };
  if (patch.error !== undefined) {
    metadataUpdate.error = patch.error;
  }
  if (patch.timestamp !== undefined) {
    metadataUpdate.timestamp = patch.timestamp;
  }
  return metadataUpdate;
}

/**
 * Atomic JSONB metadata update when `{statusColumn}` matches {@link expectedStatus}.
 */
export async function updateAsyncMetadataIfStatus<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  repo: Repository<T>,
  columns: AsyncMetadataColumns,
  scope: AsyncMetadataScopedRow,
  expectedStatus: AsyncMetadataEmbedded["status"] | null,
  patch: AsyncMetadataStatusPatch,
  manager?: EntityManager,
): Promise<boolean> {
  const { metadataField, statusColumn } = columns;
  const metadataUpdate = buildMetadataUpdate(patch);
  const qb = (manager ?? repo.manager)
    .createQueryBuilder()
    .update(entity)
    .set({ [metadataField]: metadataUpdate } as never)
    .where(`"id" = :id AND "user_id" = :userId`, {
      id: scope.id,
      userId: scope.userId,
    });

  if (expectedStatus === null) {
    qb.andWhere(`"${statusColumn}" IS NULL`);
  } else {
    qb.andWhere(`"${statusColumn}" = :expected`, { expected: expectedStatus });
  }

  const result = await qb.execute();
  return (result.affected ?? 0) > 0;
}

/** Marks lingering PROCESSING rows as FAILED (startup recovery). */
export async function resetStaleAsyncMetadataProcessing<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  repo: Repository<T>,
  columns: AsyncMetadataColumns,
  errorMessage: string,
): Promise<number> {
  const { metadataField, statusColumn } = columns;
  const result = await repo
    .createQueryBuilder()
    .update(entity)
    .set({
      [metadataField]: {
        status: AsyncMetadataStatusEnum.FAILED,
        error: errorMessage,
      },
    } as never)
    .where(`"${statusColumn}" = :processing`, {
      processing: AsyncMetadataStatusEnum.PROCESSING,
    })
    .execute();
  return result.affected ?? 0;
}

/**
 * Starts PROCESSING when status is NULL, FAILED, or COMPLETED (not when already PROCESSING).
 */
export async function beginAsyncMetadataProcessingWhenRestartable<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  repo: Repository<T>,
  columns: AsyncMetadataColumns,
  scope: AsyncMetadataScopedRow,
  restartableStatuses: AsyncMetadataEmbedded["status"][] = [
    AsyncMetadataStatusEnum.FAILED,
    AsyncMetadataStatusEnum.COMPLETED,
  ],
): Promise<boolean> {
  const { metadataField, statusColumn } = columns;
  const now = new Date();
  const result = await repo
    .createQueryBuilder()
    .update(entity)
    .set({
      [metadataField]: {
        status: AsyncMetadataStatusEnum.PROCESSING,
        error: null,
        timestamp: now,
      },
    } as never)
    .where(`"id" = :id AND "user_id" = :userId`, {
      id: scope.id,
      userId: scope.userId,
    })
    .andWhere(`("${statusColumn}" IS NULL OR "${statusColumn}" IN (:...restartableStatuses))`, {
      restartableStatuses,
    })
    .execute();
  return (result.affected ?? 0) > 0;
}

export const AsyncMetadataHelper = {
  updateIfStatus: updateAsyncMetadataIfStatus,
  resetStaleProcessing: resetStaleAsyncMetadataProcessing,
  beginProcessingWhenRestartable: beginAsyncMetadataProcessingWhenRestartable,
};
