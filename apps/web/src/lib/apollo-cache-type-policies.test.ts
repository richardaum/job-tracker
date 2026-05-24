import { gql, InMemoryCache } from "@apollo/client";
import { describe, expect, it } from "vitest";

import { apolloCacheTypePolicies } from "@/lib/apollo-cache-type-policies";

const MATCH_ID = "match-1";

const matchFragment = gql`
  fragment MatchAnalysis on MatchAnalysisType {
    id
    generationMetadata {
      status
    }
    items {
      id
      requirement
    }
  }
`;

const matchReadFragment = gql`
  fragment MatchAnalysisRead on MatchAnalysisType {
    generationMetadata {
      status
    }
    items {
      id
      requirement
    }
  }
`;

const jobMatchSummaryFragment = gql`
  fragment JobMatchSummary on MatchAnalysisType {
    id
    scoreRatio
    generationMetadata {
      status
    }
  }
`;

function createCache() {
  return new InMemoryCache({ typePolicies: apolloCacheTypePolicies });
}

function writeMatch(
  cache: InMemoryCache,
  match: {
    id: string;
    status: string;
    items: Array<{ id: string; requirement: string }>;
  },
) {
  cache.writeFragment({
    id: `MatchAnalysisType:${match.id}`,
    fragment: matchFragment,
    data: {
      __typename: "MatchAnalysisType",
      id: match.id,
      generationMetadata: {
        __typename: "AsyncMetadataType",
        status: match.status,
      },
      items: match.items.map((item) => ({
        __typename: "MatchItemType",
        ...item,
      })),
    },
  });
}

describe("apolloCacheTypePolicies", () => {
  it("normalizes match items by id and preserves them on partial match writes", () => {
    const cache = createCache();

    writeMatch(cache, {
      id: MATCH_ID,
      status: "COMPLETED",
      items: [{ id: "item-1", requirement: "TypeScript" }],
    });

    cache.writeFragment({
      id: `MatchAnalysisType:${MATCH_ID}`,
      fragment: jobMatchSummaryFragment,
      data: {
        __typename: "MatchAnalysisType",
        id: MATCH_ID,
        scoreRatio: 0.82,
        generationMetadata: {
          __typename: "AsyncMetadataType",
          status: "COMPLETED",
        },
      },
    });

    const result = cache.readFragment({
      id: `MatchAnalysisType:${MATCH_ID}`,
      fragment: matchReadFragment,
    });

    expect(result).toEqual({
      __typename: "MatchAnalysisType",
      generationMetadata: {
        __typename: "AsyncMetadataType",
        status: "COMPLETED",
      },
      items: [
        {
          __typename: "MatchItemType",
          id: "item-1",
          requirement: "TypeScript",
        },
      ],
    });
  });

  it("replaces normalized items when a full match write includes new item ids", () => {
    const cache = createCache();

    writeMatch(cache, {
      id: MATCH_ID,
      status: "COMPLETED",
      items: [{ id: "item-1", requirement: "TypeScript" }],
    });

    writeMatch(cache, {
      id: MATCH_ID,
      status: "COMPLETED",
      items: [{ id: "item-2", requirement: "React" }],
    });

    const result = cache.readFragment({
      id: `MatchAnalysisType:${MATCH_ID}`,
      fragment: gql`
        fragment MatchAnalysisItems on MatchAnalysisType {
          items {
            id
            requirement
          }
        }
      `,
    });

    expect(result).toEqual({
      __typename: "MatchAnalysisType",
      items: [
        { __typename: "MatchItemType", id: "item-2", requirement: "React" },
      ],
    });
  });
});
