import { useCallback, useState } from "react";
import type { Mock } from "vitest";
import { vi } from "vitest";

import type { JobMatchData } from "@/modules/jobs/details/testing/match-tab-test-fixtures";

export function getMatchStatusChangedHandler(
  subscriptionMock: Mock,
): (evt: { status: string }) => void | Promise<void> {
  const call = subscriptionMock.mock.calls.find((entry) => entry[0].onData !== undefined);
  if (!call) {
    throw new Error("jobMatchStatusChanged subscription handler not registered");
  }

  const onData = call[0].onData as
    | ((opts: { data: { data?: { jobMatchStatusChanged?: { status: string } } } }) => void)
    | undefined;
  if (!onData) {
    throw new Error("jobMatchStatusChanged subscription onData handler not found");
  }

  return (evt: { status: string }) => {
    onData({ data: { data: { jobMatchStatusChanged: evt } } });
  };
}

export function setupReactiveJobMatchQuery(
  useJobMatchQueryMock: Mock,
  options: { initial: JobMatchData; afterRefetch: JobMatchData },
) {
  useJobMatchQueryMock.mockImplementation(() => {
    const [jobMatch, setJobMatch] = useState(options.initial);

    const refetch = useCallback(async () => {
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
  options.useGenerateJobMatchMutationMock.mockReturnValue([vi.fn().mockResolvedValue({}), { loading: false }]);
  options.useDeleteMatchAnalysisMutationMock.mockReturnValue([vi.fn().mockResolvedValue({})]);
}
