import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WelcomeTourJoyride } from "./WelcomeTourJoyride";

const tourMocks = vi.hoisted(() => ({
  complete: vi.fn(),
  completeCurrentSegment: vi.fn(),
  skip: vi.fn(),
  status: "finished",
  stepNumber: 5,
  totalSteps: 14,
}));

vi.mock("react-joyride", () => ({
  EVENTS: { TOUR_END: "tour:end" },
  STATUS: { FINISHED: "finished", SKIPPED: "skipped" },
  Joyride: ({ onEvent }: { onEvent?: (event: unknown, controls: unknown) => void }) => (
    <button
      type="button"
      onClick={() =>
        onEvent?.(
          {
            status: tourMocks.status,
            step: { data: { stepNumber: tourMocks.stepNumber, totalSteps: tourMocks.totalSteps } },
            type: "tour:end",
          },
          {},
        )
      }
    >
      End segment
    </button>
  ),
}));

vi.mock("./useWelcomeTour", () => ({
  useWelcomeTour: () => ({
    completeCurrentSegment: tourMocks.completeCurrentSegment,
    complete: tourMocks.complete,
    skip: tourMocks.skip,
  }),
}));

describe("WelcomeTourJoyride", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    tourMocks.stepNumber = 5;
    tourMocks.status = "finished";
    tourMocks.totalSteps = 14;
  });

  afterEach(() => vi.unstubAllGlobals());

  it("advances an intermediate segment and runs its callback", () => {
    const onSegmentComplete = vi.fn();
    render(<WelcomeTourJoyride run steps={[]} onSegmentComplete={onSegmentComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "End segment" }));

    expect(tourMocks.completeCurrentSegment).toHaveBeenCalledOnce();
    expect(onSegmentComplete).toHaveBeenCalledOnce();
    expect(tourMocks.complete).not.toHaveBeenCalled();
  });

  it("completes the tour and runs the final callback at the final step", () => {
    const onTourComplete = vi.fn();
    tourMocks.stepNumber = 14;
    render(<WelcomeTourJoyride run steps={[]} onTourComplete={onTourComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "End segment" }));

    expect(tourMocks.complete).toHaveBeenCalledOnce();
    expect(onTourComplete).toHaveBeenCalledOnce();
  });

  it("marks the tour as skipped", () => {
    tourMocks.status = "skipped";
    render(<WelcomeTourJoyride run steps={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "End segment" }));

    expect(tourMocks.skip).toHaveBeenCalledOnce();
    expect(tourMocks.complete).not.toHaveBeenCalled();
    expect(tourMocks.completeCurrentSegment).not.toHaveBeenCalled();
  });
});
