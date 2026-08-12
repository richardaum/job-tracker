import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WelcomeTourJobsList } from "./WelcomeTourJobsList";
import { WelcomeTourProvider } from "@/modules/welcome-tour/WelcomeTourProvider";

const useFeatureFlagEnabledMock = vi.fn();
const joyridePropsMock = vi.fn();
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
  ACTIONS: { PREV: "prev" },
  EVENTS: { TOOLTIP: "tooltip", TOUR_END: "tour:end" },
  Joyride: (props: { onEvent?: (event: { type: string; step: { target: string } }) => void }) => {
    joyridePropsMock(props);
    return (
      <button
        type="button"
        data-testid="welcome-tour"
        onClick={() =>
          props.onEvent?.({ type: "tooltip", step: { target: '[data-welcome-tour-step="active-jobs-filter"]' } })
        }
      />
    );
  },
}));

describe("WelcomeTourJobsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    useTourProgressQueryMock.mockReturnValue({ data: undefined, loading: false });
    saveTourProgressMock.mockResolvedValue(undefined);
  });

  it("does not render before the feature flag resolves to enabled", () => {
    useFeatureFlagEnabledMock.mockReturnValue(undefined);

    renderWelcomeTour();

    expect(screen.queryByTestId("welcome-tour")).not.toBeInTheDocument();
  });

  it("renders when the welcome tour feature flag is enabled", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    renderWelcomeTour();

    expect(useFeatureFlagEnabledMock).toHaveBeenCalledWith("welcome-tour-enabled");
    expect(screen.getByTestId("welcome-tour")).toBeInTheDocument();
  });

  it("includes a final step for the Create button", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    renderWelcomeTour();

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            target: '[data-welcome-tour-step="create-job-button"]',
            content: expect.stringContaining("Click Create"),
          }),
        ]),
      }),
    );
  });

  it("renders the tour in the supplied portal with a viewport overlay", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);
    const portalElement = document.createElement("div");

    render(
      <WelcomeTourProvider>
        <WelcomeTourJobsList portalElement={portalElement} />
      </WelcomeTourProvider>,
    );

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ portalElement, styles: expect.objectContaining({ overlay: { position: "fixed" } }) }),
    );
  });

  it("explains that the tutorial does not require real data", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    renderWelcomeTour();

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            target: "body",
            content: expect.objectContaining({
              props: expect.objectContaining({
                children: expect.arrayContaining([
                  "Don't worry about using real data—everything you enter is just for this tutorial.",
                ]),
              }),
            }),
          }),
        ]),
      }),
    );
  });

  it("numbers the create-job step as 5 of the full 25-step welcome tour sequence", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    renderWelcomeTour();

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            target: '[data-welcome-tour-step="create-job-button"]',
            data: expect.objectContaining({ stepNumber: 5, totalSteps: 25 }),
          }),
        ]),
      }),
    );
  });

  it("marks guided form inputs as advancing on Enter", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    renderWelcomeTour();

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            target: '[data-welcome-tour-step="job-title-input"]',
            data: expect.objectContaining({ advanceOnEnter: true }),
          }),
          expect.objectContaining({
            target: '[data-welcome-tour-step="job-company-input"]',
            data: expect.objectContaining({ advanceOnEnter: true }),
          }),
        ]),
      }),
    );
  });

  it("guides the user to select Active before showing the final jobs list", async () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);
    mockJobsListProgress();

    renderWelcomeTour();

    await waitFor(() => {
      expect(joyridePropsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: [
            expect.objectContaining({
              target: '[data-welcome-tour-step="active-jobs-filter"]',
              disableFocusTrap: true,
              data: expect.objectContaining({ stepNumber: 24, totalSteps: 25, disablePrimary: true }),
            }),
            expect.objectContaining({
              target: '[data-welcome-tour-step="active-jobs-list"]',
              placement: "bottom",
              data: expect.objectContaining({ stepNumber: 25, totalSteps: 25 }),
            }),
          ],
        }),
      );
    });
  });

  it("focuses the Active filter when its guided step opens", async () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);
    mockJobsListProgress();
    const activeFilter = document.createElement("button");
    activeFilter.dataset.welcomeTourStep = "active-jobs-filter";
    document.body.append(activeFilter);

    renderWelcomeTour();
    await waitFor(() => {
      expect(joyridePropsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({ target: '[data-welcome-tour-step="active-jobs-filter"]' }),
          ]),
        }),
      );
    });
    fireEvent.click(screen.getByTestId("welcome-tour"));

    expect(activeFilter).toHaveFocus();
    activeFilter.remove();
  });
});

function renderWelcomeTour() {
  return render(
    <WelcomeTourProvider>
      <WelcomeTourJobsList />
    </WelcomeTourProvider>,
  );
}

function mockJobsListProgress() {
  useTourProgressQueryMock.mockReturnValue({
    data: { tourProgress: { status: "InProgress", currentStepId: "jobs-list" } },
    loading: false,
  });
}
