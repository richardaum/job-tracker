import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Onboarding } from "./Onboarding";

const useFeatureFlagEnabledMock = vi.fn();
const joyridePropsMock = vi.fn();

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => useFeatureFlagEnabledMock(...args),
}));

vi.mock("react-joyride", () => ({
  Joyride: (props: unknown) => {
    joyridePropsMock(props);
    return <div data-testid="onboarding-tour" />;
  },
}));

describe("Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render before the feature flag resolves to enabled", () => {
    useFeatureFlagEnabledMock.mockReturnValue(undefined);

    render(<Onboarding />);

    expect(screen.queryByTestId("onboarding-tour")).not.toBeInTheDocument();
  });

  it("renders when the onboarding feature flag is enabled", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    render(<Onboarding />);

    expect(useFeatureFlagEnabledMock).toHaveBeenCalledWith("onboarding-enabled");
    expect(screen.getByTestId("onboarding-tour")).toBeInTheDocument();
  });

  it("includes a final step for the Create button", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    render(<Onboarding />);

    expect(joyridePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: expect.arrayContaining([
          expect.objectContaining({
            target: '[data-onboarding-step="create-job-button"]',
            content: expect.stringContaining("Click Create"),
          }),
        ]),
      }),
    );
  });

  it("explains that the tutorial does not require real data", () => {
    useFeatureFlagEnabledMock.mockReturnValue(true);

    render(<Onboarding />);

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
});
