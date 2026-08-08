import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateQuickJob } from "./useCreateQuickJob";

const createJobMutationMock = vi.fn();
const createLocalJobMock = vi.fn();
const useJobDataSourceMock = vi.fn();

vi.mock("@/gql/hooks", () => ({
  JobsDocument: {},
  QuickFilterCountsDocument: {},
  useCreateJobMutation: () => [createJobMutationMock, { loading: false }],
}));

vi.mock("@/modules/jobs/shared/hooks/useCreateLocalJob", () => ({
  useCreateLocalJob: () => ({ createLocalJob: createLocalJobMock, isCreatingLocalJob: false }),
}));

vi.mock("@/modules/jobs/shared/hooks/useJobDataSource", () => ({ useJobDataSource: () => useJobDataSourceMock() }));

describe("useCreateQuickJob", () => {
  const onCreated = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useJobDataSourceMock.mockReturnValue("local");
  });

  it("stores a tutorial job without calling the create-job mutation", async () => {
    createLocalJobMock.mockResolvedValue("welcome-tour-job");
    const { result } = renderHook(() => useCreateQuickJob({ onCreated, onError }));

    let didCreate = false;
    await act(async () => {
      didCreate = await result.current.createQuickJob({ title: "Frontend Engineer", company: "Acme" });
    });

    expect(didCreate).toBe(true);
    expect(createLocalJobMock).toHaveBeenCalledWith({ title: "Frontend Engineer", company: "Acme" });
    expect(createJobMutationMock).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith("welcome-tour-job");
    expect(onError).not.toHaveBeenCalled();
  });
});
