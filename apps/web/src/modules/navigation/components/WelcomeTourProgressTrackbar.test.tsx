import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WelcomeTourProgressTrackbar } from "./WelcomeTourProgressTrackbar";

const { enqueueToastMock, pushMock, resetMock, useFeatureFlagEnabledMock, useWelcomeTourMock } = vi.hoisted(() => ({
  enqueueToastMock: vi.fn(),
  pushMock: vi.fn(),
  resetMock: vi.fn(),
  useFeatureFlagEnabledMock: vi.fn(),
  useWelcomeTourMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => useFeatureFlagEnabledMock(...args),
}));

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: enqueueToastMock }),
}));

vi.mock("@/modules/welcome-tour/useWelcomeTour", () => ({ useWelcomeTour: () => useWelcomeTourMock() }));

describe("WelcomeTourProgressTrackbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMock.mockResolvedValue(true);
    useFeatureFlagEnabledMock.mockReturnValue(true);
    useWelcomeTourMock.mockReturnValue({ activePhase: "status-history", reset: resetMock, tourStatus: "InProgress" });
  });

  it("shows the active welcome-tour segment", () => {
    render(<WelcomeTourProgressTrackbar />);

    expect(screen.getByText("Welcome tour")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Welcome tour progress" })).toHaveAttribute("aria-valuenow", "5");
  });

  it("restarts the tour after confirmation", async () => {
    const user = userEvent.setup();
    render(<WelcomeTourProgressTrackbar />);

    await user.click(screen.getByRole("button", { name: "Reset tour" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Reset tour" }));

    expect(resetMock).toHaveBeenCalledOnce();
    expect(pushMock).toHaveBeenCalledWith("/jobs");
    expect(enqueueToastMock).toHaveBeenCalledWith({ title: "Welcome tour reset.", intent: "success" });
  });
});
