import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WelcomeTourProvider } from "@/modules/welcome-tour/WelcomeTourProvider";

import { WelcomeTourStatusHistory } from "./WelcomeTourStatusHistory";

const useFeatureFlagEnabledMock = vi.fn();
const joyridePropsMock = vi.fn();
const useTourProgressQueryMock = vi.fn();
const saveTourProgressMock = vi.fn();

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => useFeatureFlagEnabledMock(...args),
}));

vi.mock("@/gql/hooks", () => ({
  TourProgressStatus: { InProgress: "InProgress", Completed: "Completed", Skipped: "Skipped" },
  useResetTourProgressMutation: () => [vi.fn()],
  useSaveTourProgressMutation: () => [saveTourProgressMock],
  useTourProgressQuery: (...args: unknown[]) => useTourProgressQueryMock(...args),
}));

vi.mock("react-joyride", () => ({
  ACTIONS: { NEXT: "next" },
  Joyride: ({ steps, ...props }: { steps: Array<{ after?: (event: { action: string }) => void; target: string }> }) => {
    joyridePropsMock({ steps, ...props });
    return (
      <button
        type="button"
        onClick={() =>
          steps
            .find((step) => step.target === '[data-welcome-tour-step="status-panel-tab"]')
            ?.after?.({ action: "next" })
        }
      >
        Open status tab
      </button>
    );
  },
}));

describe("WelcomeTourStatusHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.setItem(
      "job-tracker:tour-session:v1",
      JSON.stringify({ active: true, tourId: "welcome-tour", phase: "status-history" }),
    );
    useFeatureFlagEnabledMock.mockReturnValue(true);
    useTourProgressQueryMock.mockReturnValue({ data: undefined, loading: false });
    saveTourProgressMock.mockResolvedValue(undefined);
  });

  it("opens the Status tab after its guided step", async () => {
    const onOpenStatusHistory = vi.fn();
    const user = userEvent.setup();

    renderWelcomeTour(onOpenStatusHistory);

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [
          expect.objectContaining({
            target: '[data-welcome-tour-step="status-panel-tab"]',
            data: expect.objectContaining({ stepNumber: 22, totalSteps: 25 }),
          }),
          expect.objectContaining({
            target: '[data-welcome-tour-step="update-status-timeline"]',
            data: expect.objectContaining({ stepNumber: 23, totalSteps: 25 }),
          }),
        ],
      }),
    );

    await user.click(screen.getByRole("button", { name: "Open status tab" }));

    expect(onOpenStatusHistory).toHaveBeenCalledOnce();
  });
});

function renderWelcomeTour(onOpenStatusHistory: () => void) {
  return render(
    <WelcomeTourProvider>
      <WelcomeTourStatusHistory onOpenStatusHistory={onOpenStatusHistory} onReturnToJobs={vi.fn()} />
    </WelcomeTourProvider>,
  );
}
