import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resetTourProgressMock, saveTourProgressMock, tourProgressQueryMock, useSaveTourProgressMutationMock } =
  vi.hoisted(() => ({
    resetTourProgressMock: vi.fn(),
    saveTourProgressMock: vi.fn(),
    tourProgressQueryMock: vi.fn(),
    useSaveTourProgressMutationMock: vi.fn(),
  }));

vi.mock("@/gql/hooks", () => ({
  TourProgressStatus: { InProgress: "InProgress", Completed: "Completed", Skipped: "Skipped" },
  useResetTourProgressMutation: () => [resetTourProgressMock],
  useSaveTourProgressMutation: useSaveTourProgressMutationMock,
  useTourProgressQuery: tourProgressQueryMock,
}));

import { WelcomeTourProvider } from "./WelcomeTourProvider";
import { useWelcomeTour } from "./useWelcomeTour";
import { WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY } from "./welcomeTourJobDraft";

function Wrapper({ children }: { children: ReactNode }) {
  return <WelcomeTourProvider>{children}</WelcomeTourProvider>;
}

describe("WelcomeTourProvider", () => {
  beforeEach(() => {
    resetTourProgressMock.mockResolvedValue({});
    saveTourProgressMock.mockResolvedValue({});
    tourProgressQueryMock.mockReturnValue({ data: { tourProgress: null }, loading: false });
    useSaveTourProgressMutationMock.mockReturnValue([saveTourProgressMock]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("keeps the created-job toast ID until the details segment consumes it", () => {
    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    act(() => result.current.setCreatedJobToastId("toast-1"));

    expect(result.current.createdJobToastId).toBe("toast-1");

    let toastId: string | null = null;
    act(() => {
      toastId = result.current.takeCreatedJobToastId();
    });

    expect(toastId).toBe("toast-1");
    expect(result.current.createdJobToastId).toBeNull();
  });

  it("restores an in-progress tour phase from the backend", async () => {
    tourProgressQueryMock.mockReturnValue({
      data: { tourProgress: { currentStepId: "job-details", status: "InProgress" } },
      loading: false,
    });

    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.activePhase).toBe("job-details"));
  });

  it("persists the initial phase and completion", () => {
    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    act(() => result.current.start());
    act(() => result.current.complete());

    expect(saveTourProgressMock).toHaveBeenNthCalledWith(1, {
      variables: {
        input: { currentStepId: "job-creation", status: "InProgress", tourId: "welcome-tour", tourVersion: 1 },
      },
    });
    expect(saveTourProgressMock).toHaveBeenNthCalledWith(2, {
      variables: { input: { currentStepId: null, status: "Completed", tourId: "welcome-tour", tourVersion: 1 } },
    });
  });

  it("clears the previous tour job draft before starting", () => {
    window.localStorage.setItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY, JSON.stringify({ id: "welcome-tour-job" }));

    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    act(() => result.current.start());

    expect(window.localStorage.getItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("resets persisted and browser tour progress to the initial phase", async () => {
    tourProgressQueryMock.mockReturnValue({
      data: { tourProgress: { currentStepId: null, status: "Completed", tourVersion: 1 } },
      loading: false,
    });
    window.localStorage.setItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY, JSON.stringify({ id: "welcome-tour-job" }));
    window.sessionStorage.setItem(
      "job-tracker:tour-session:v1",
      JSON.stringify({ active: true, tourId: "welcome-tour", phase: "jobs-list" }),
    );

    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    let didReset = false;
    await act(async () => {
      didReset = await result.current.reset();
    });

    expect(didReset).toBe(true);
    expect(result.current.activePhase).toBe("job-creation");
    expect(window.localStorage.getItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem("job-tracker:tour-session:v1")).toContain('"phase":"job-creation"');
    expect(resetTourProgressMock).toHaveBeenCalledWith({
      variables: { input: { currentStepId: "job-creation", tourId: "welcome-tour", tourVersion: 1 } },
    });
  });

  it("does not restart a completed tour", async () => {
    tourProgressQueryMock.mockReturnValue({
      data: { tourProgress: { currentStepId: null, status: "Completed" } },
      loading: false,
    });

    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.activePhase).toBeNull());
    act(() => result.current.start());

    expect(saveTourProgressMock).not.toHaveBeenCalled();
  });

  it("restarts the tour when the stored version is older", async () => {
    tourProgressQueryMock.mockReturnValue({
      data: { tourProgress: { currentStepId: null, status: "Completed", tourVersion: 0 } },
      loading: false,
    });

    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.activePhase).toBe("job-creation"));
    act(() => result.current.start());

    expect(saveTourProgressMock).toHaveBeenCalledWith({
      variables: {
        input: { currentStepId: "job-creation", status: "InProgress", tourId: "welcome-tour", tourVersion: 1 },
      },
    });
  });
});
