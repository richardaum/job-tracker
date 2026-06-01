import type { JobMatchQuery } from "@/gql/hooks";
import {
  AsyncMetadataStatus,
  FitClassification,
  MatchSource,
  MatchVerdict,
  RequirementType,
  Weight,
} from "@/gql/hooks";

export type JobMatchData = NonNullable<JobMatchQuery["jobMatch"]>;

export function mockMatchItem(partial: {
  id?: string;
  verdict: MatchVerdict;
  requirement?: string;
  source?: MatchSource;
}): JobMatchData["items"][number] {
  return {
    __typename: "MatchItemType",
    id: partial.id ?? `match-item-${partial.verdict}`,
    requirement: partial.requirement ?? `${partial.verdict} requirement`,
    source: partial.source ?? MatchSource.Resume,
    weight: Weight.High,
    type: RequirementType.MustHave,
    verdict: partial.verdict,
    jdQuote: "JD quote",
    sourceQuotes: ["Resume quote"],
    suggestion: null,
  };
}

export function completedJobMatch(
  items: JobMatchData["items"],
  options: { id?: string; resumeId?: string | null; jobId?: string } = {},
): JobMatchData {
  const { id = "match-42", resumeId = "resume-88", jobId = "job-1" } = options;

  return {
    __typename: "MatchAnalysisType",
    id,
    jobId,
    resumeId,
    generationMetadata: {
      __typename: "AsyncMetadataType",
      status: AsyncMetadataStatus.Completed,
      error: null,
      timestamp: null,
    },
    scoreRatio: 76,
    classification: FitClassification.Positive,
    matchCount: 2,
    gapCount: 1,
    unclearCount: 0,
    items,
    createdAt: new Date().toISOString(),
  } as JobMatchData;
}

export function processingJobMatch(
  options: { id?: string; resumeId?: string | null; jobId?: string } = {},
): JobMatchData {
  return {
    ...completedJobMatch([], options),
    items: [],
    generationMetadata: {
      __typename: "AsyncMetadataType",
      status: AsyncMetadataStatus.Processing,
      error: null,
      timestamp: null,
    },
  };
}

export function failedJobMatch(
  error: string,
  options: { id?: string; resumeId?: string | null; jobId?: string } = {},
): JobMatchData {
  return {
    ...completedJobMatch([], options),
    items: [],
    generationMetadata: { __typename: "AsyncMetadataType", status: AsyncMetadataStatus.Failed, error, timestamp: null },
  };
}
