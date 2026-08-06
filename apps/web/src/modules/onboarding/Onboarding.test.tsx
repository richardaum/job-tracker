import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Onboarding } from "./Onboarding";

const useFeatureFlagEnabledMock = vi.fn();

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => useFeatureFlagEnabledMock(...args),
}));

vi.mock("react-joyride", () => ({ Joyride: () => <div data-testid="onboarding-tour" /> }));

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
});
