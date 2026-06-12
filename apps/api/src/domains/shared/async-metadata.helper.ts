import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import type { EntityManager, EntityTarget, ObjectLiteral, Repository } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export type AsyncMetadataColumns = { metadataField: string; statusColumn: string };

export type AsyncMetadataStatusPatch = Partial<AsyncMetadataEmbedded> & { status: AsyncMetadataEmbedded["status"] };

export type AsyncMetadataScopedRow = { id: string; userId: string };

function buildMetadataUpdate(patch: AsyncMetadataStatusPatch): Partial<AsyncMetadataEmbedded> {
  const metadataUpdate: Partial<AsyncMetadataEmbedded> = { status: patch.status };
  if (patch.error !== undefined) {
    metadataUpdate.error = patch.error;
  }
  if (patch.timestamp !== undefined) {
    metadataUpdate.timestamp = patch.timestamp;
  }
  return metadataUpdate;
}

/** TypeORM `.set()` cannot infer dynamic JSONB column keys — payload is typed at the ORM boundary. */
function metadataSetPayload<T extends ObjectLiteral>(
  metadataField: string,
  patch: Partial<AsyncMetadataEmbedded>,
): QueryDeepPartialEntity<T> {
  return { [metadataField]: patch } as QueryDeepPartialEntity<T>;
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
    .set(metadataSetPayload<T>(metadataField, metadataUpdate))
    .where(`"id" = :id AND "user_id" = :userId`, { id: scope.id, userId: scope.userId });

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
    .set(
      metadataSetPayload<T>(
        metadataField,
        buildMetadataUpdate({ status: AsyncMetadataStatusEnum.Failed, error: errorMessage }),
      ),
    )
    .where(`"${statusColumn}" = :processing`, { processing: AsyncMetadataStatusEnum.Processing })
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
    AsyncMetadataStatusEnum.Failed,
    AsyncMetadataStatusEnum.Completed,
  ],
): Promise<boolean> {
  const { metadataField, statusColumn } = columns;
  const now = new Date();
  const result = await repo
    .createQueryBuilder()
    .update(entity)
    .set(
      metadataSetPayload<T>(
        metadataField,
        buildMetadataUpdate({ status: AsyncMetadataStatusEnum.Processing, error: null, timestamp: now }),
      ),
    )
    .where(`"id" = :id AND "user_id" = :userId`, { id: scope.id, userId: scope.userId })
    .andWhere(`("${statusColumn}" IS NULL OR "${statusColumn}" IN (:...restartableStatuses))`, { restartableStatuses })
    .execute();
  return (result.affected ?? 0) > 0;
}

export const AsyncMetadataHelper = {
  updateIfStatus: updateAsyncMetadataIfStatus,
  resetStaleProcessing: resetStaleAsyncMetadataProcessing,
  beginProcessingWhenRestartable: beginAsyncMetadataProcessingWhenRestartable,
};
