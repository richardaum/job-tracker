import { type ApolloCache, gql, type Reference } from "@apollo/client";

import { AsyncMetadataStatus, type AsyncMetadataType } from "@/gql/hooks";

const jobSummaryCacheExistsFragment = gql`
  fragment JobSummaryCacheExists on JobType {
    id
  }
`;

export function writeJobSummaryStatusToCache(
  cache: ApolloCache,
  jobId: string,
  status: AsyncMetadataStatus,
): boolean {
  const cacheId = cache.identify({ __typename: "JobType", id: jobId });
  if (!cacheId) {
    return false;
  }

  const existing = cache.readFragment<{ id: string }>({
    id: cacheId,
    fragment: jobSummaryCacheExistsFragment,
  });
  if (!existing) {
    return false;
  }

  cache.modify({
    id: cacheId,
    fields: {
      summaryMetadata(existing: AsyncMetadataType | Reference | undefined): AsyncMetadataType {
        return {
          ...readStoredAsyncMetadata(existing),
          __typename: "AsyncMetadataType",
          status,
          timestamp: new Date().toISOString(),
        };
      },
    },
  });

  return true;
}

export function writeJobSummaryToCache(
  cache: ApolloCache,
  jobId: string,
  summary: string,
  metadata: {
    status?: AsyncMetadataStatus | null;
    error?: string | null;
    timestamp?: unknown | null;
  },
): boolean {
  const cacheId = cache.identify({ __typename: "JobType", id: jobId });
  if (!cacheId) {
    return false;
  }

  const existing = cache.readFragment<{ id: string }>({
    id: cacheId,
    fragment: jobSummaryCacheExistsFragment,
  });
  if (!existing) {
    return false;
  }

  cache.modify({
    id: cacheId,
    fields: {
      summary() {
        return summary;
      },
      summaryMetadata() {
        return {
          __typename: "AsyncMetadataType",
          status: metadata.status ?? null,
          error: metadata.error ?? null,
          timestamp: metadata.timestamp ?? null,
        };
      },
    },
  });

  return true;
}

function readStoredAsyncMetadata(
  existing: AsyncMetadataType | Reference | undefined,
): AsyncMetadataType {
  if (existing == null || isCacheReference(existing)) {
    return {};
  }

  return existing;
}

function isCacheReference(value: AsyncMetadataType | Reference): value is Reference {
  return "__ref" in value;
}
