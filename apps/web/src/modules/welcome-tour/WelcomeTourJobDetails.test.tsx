import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WelcomeTourProvider } from "@/modules/welcome-tour/WelcomeTourProvider";
import { WelcomeTourJobDetails } from "./WelcomeTourJobDetails";

const useFeatureFlagEnabledMock = vi.fn();
const useTourProgressQueryMock = vi.fn();
const saveTourProgressMock = vi.fn();

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => useFeatureFlagEnabledMock(...args),
}));

vi.mock("@/gql/hooks", () => ({
  TourProgressStatus: { InProgress: "InProgress", Completed: "Completed", Skipped: "Skipped" },
  useSaveTourProgressMutation: () => [saveTourProgressMock],
  useTourProgressQuery: (...args: unknown[]) => useTourProgressQueryMock(...args),
}));

vi.mock("react-joyride", () => ({
  ACTIONS: { NEXT: "next" },
  EVENTS: { TOOLTIP: "tooltip", TOUR_END: "tour:end" },
  STATUS: { FINISHED: "finished", SKIPPED: "skipped" },
  Joyride: ({
    onEvent,
    steps,
  }: {
    onEvent?: (event: { status: string; step: { data: object }; type: string }, controls: object) => void;
    steps: Array<{ after?: (event: { action: string }) => void; target: string }>;
  }) => (
    <>
      <button
        type="button"
        onClick={() =>
          steps
            .find((step) => step.target === '[data-welcome-tour-step="job-created-toast"]')
            ?.after?.({ action: "next" })
        }
      >
        Advance created toast
      </button>
      <button type="button" onClick={() => onEvent?.({ status: "skipped", step: { data: {} }, type: "tour:end" }, {})}>
        Skip tour
      </button>
    </>
  ),
}));

describe("WelcomeTourJobDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.setItem(
      "job-tracker:tour-session:v1",
      JSON.stringify({ active: true, tourId: "welcome-tour", phase: "job-details" }),
    );
    useFeatureFlagEnabledMock.mockReturnValue(true);
    useTourProgressQueryMock.mockReturnValue({ data: undefined, loading: false });
    saveTourProgressMock.mockResolvedValue(undefined);
  });

  it("closes the created-job toast after advancing its tour step", async () => {
    const onCloseJobCreatedToast = vi.fn();
    const user = userEvent.setup();

    renderWelcomeTour(onCloseJobCreatedToast);

    await user.click(screen.getByRole("button", { name: "Advance created toast" }));

    expect(onCloseJobCreatedToast).toHaveBeenCalledOnce();
  });

  it("closes the created-job toast when the tour is skipped", async () => {
    const onCloseJobCreatedToast = vi.fn();
    const user = userEvent.setup();

    renderWelcomeTour(onCloseJobCreatedToast);

    await user.click(screen.getByRole("button", { name: "Skip tour" }));

    expect(onCloseJobCreatedToast).toHaveBeenCalledOnce();
  });
});

function renderWelcomeTour(onCloseJobCreatedToast: () => void) {
  return render(
    <WelcomeTourProvider>
      <WelcomeTourJobDetails
        onFieldActionsVisibilityChange={vi.fn()}
        onDescriptionOpen={vi.fn()}
        onUpdateStatus={vi.fn()}
        onUpdateStatusClose={vi.fn()}
        onUpdateStatusSave={vi.fn()}
        onStatusDialogRestrictInteractionToChange={vi.fn()}
        onFocusField={vi.fn()}
        onStatusDialogFreezeSuccessToastChange={vi.fn()}
        onCloseStatusToast={vi.fn()}
        onCloseJobCreatedToast={onCloseJobCreatedToast}
        statusDialogSaveCount={0}
      />
    </WelcomeTourProvider>,
  );
}
