import React from "react";
import type { Mock } from "vitest";
import { vi } from "vitest";

import type { JobMatchData } from "@/modules/jobs/details/testing/match-tab-test-fixtures";

export function getMatchStatusChangedHandler(
  useEventSourceMock: Mock,
): (evt: { status: string }) => void | Promise<void> {
  const call = useEventSourceMock.mock.calls.find(
    (entry) => entry[1] === "match_status_changed",
  );
  if (!call) {
    throw new Error("match_status_changed SSE handler not registered");
  }

  return call[2] as (evt: { status: string }) => void | Promise<void>;
}

export function setupReactiveJobMatchQuery(
  useJobMatchQueryMock: Mock,
  options: { initial: JobMatchData; afterRefetch: JobMatchData },
) {
  useJobMatchQueryMock.mockImplementation(() => {
    const [jobMatch, setJobMatch] = React.useState(options.initial);

    const refetch = React.useCallback(async () => {
      setJobMatch(options.afterRefetch);
      return { data: { jobMatch: options.afterRefetch } };
    }, []);

    return { data: { jobMatch }, loading: false, error: undefined, refetch };
  });
}

export function setupReactiveMatchTabGraphqlMocks(
  useJobMatchQueryMock: Mock,
  options: {
    initial: JobMatchData;
    afterRefetch: JobMatchData;
    useGenerateJobMatchMutationMock: Mock;
    useDeleteMatchAnalysisMutationMock: Mock;
  },
) {
  setupReactiveJobMatchQuery(useJobMatchQueryMock, options);
  options.useGenerateJobMatchMutationMock.mockReturnValue([
    vi.fn().mockResolvedValue({}),
    { loading: false },
  ]);
  options.useDeleteMatchAnalysisMutationMock.mockReturnValue([
    vi.fn().mockResolvedValue({}),
  ]);
}
