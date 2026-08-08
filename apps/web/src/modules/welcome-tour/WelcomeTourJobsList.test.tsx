import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WelcomeTourJobsList } from "./WelcomeTourJobsList";
import { TourProvider } from "./TourProvider";

const useFeatureFlagEnabledMock = vi.fn();
const joyridePropsMock = vi.fn();

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => useFeatureFlagEnabledMock(...args),
}));

vi.mock("react-joyride", () => ({
  Joyride: (props: unknown) => {
    joyridePropsMock(props);
    return <div data-testid="welcome-tour" />;
  },
}));

describe("WelcomeTourJobsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
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

  it("numbers the create-job step as 5 of the full 11-step welcome tour sequence", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    renderWelcomeTour();

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            target: '[data-welcome-tour-step="create-job-button"]',
            data: expect.objectContaining({ stepNumber: 5, totalSteps: 11 }),
          }),
        ]),
      }),
    );
  });
});

function renderWelcomeTour() {
  return render(
    <TourProvider>
      <WelcomeTourJobsList />
    </TourProvider>,
  );
}
