import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { describe, expect, it } from "vitest";

import { AsyncMetadataStatus } from "@/gql/hooks";

import { writeJobSummaryStatusToCache } from "./apolloJobSummaryCache";

const jobSummaryPatchFragment = gql`
  fragment JobSummaryPatch on JobType {
    id
    summaryMetadata {
      status
    }
  }
`;

describe("writeJobSummaryStatusToCache", () => {
  it("updates summaryMetadata on a cached job", () => {
    const cache = new InMemoryCache();
    cache.writeFragment({
      id: cache.identify({ __typename: "JobType", id: "job-1" })!,
      fragment: jobSummaryPatchFragment,
      data: { __typename: "JobType", id: "job-1", summaryMetadata: null },
    });

    const updated = writeJobSummaryStatusToCache(cache, "job-1", AsyncMetadataStatus.Processing);

    expect(updated).toBe(true);
    expect(cache.readFragment({ id: "JobType:job-1", fragment: jobSummaryPatchFragment })).toEqual({
      __typename: "JobType",
      id: "job-1",
      summaryMetadata: { __typename: "AsyncMetadataType", status: AsyncMetadataStatus.Processing },
    });
  });

  it("returns false when the job is not in cache", () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: { request: () => null } as never });

    expect(writeJobSummaryStatusToCache(client.cache, "missing", AsyncMetadataStatus.Processing)).toBe(false);
  });
});
