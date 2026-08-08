import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JoyrideSegmentedTour } from "@/modules/tour/JoyrideSegmentedTour";

const tourMocks = vi.hoisted(() => ({
  action: "next",
  completeCurrentSegment: vi.fn(),
  completeTour: vi.fn(),
  stepNumber: 5,
  status: "finished",
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
            action: tourMocks.action,
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

vi.mock("@/modules/tour/useTour", () => ({
  useTour: () => ({ completeCurrentSegment: tourMocks.completeCurrentSegment, completeTour: tourMocks.completeTour }),
}));

describe("JoyrideSegmentedTour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    tourMocks.action = "next";
    tourMocks.stepNumber = 5;
    tourMocks.status = "finished";
    tourMocks.totalSteps = 14;
  });

  afterEach(() => vi.unstubAllGlobals());

  it("advances the tour and runs the external callback when an intermediate segment ends", () => {
    const onSegmentComplete = vi.fn();
    render(<JoyrideSegmentedTour run steps={[]} onSegmentComplete={onSegmentComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "End segment" }));

    expect(tourMocks.completeCurrentSegment).toHaveBeenCalledOnce();
    expect(onSegmentComplete).toHaveBeenCalledOnce();
    expect(tourMocks.completeTour).not.toHaveBeenCalled();
  });

  it("completes the tour without running a segment callback at the global final step", () => {
    const onSegmentComplete = vi.fn();
    tourMocks.stepNumber = 14;
    render(<JoyrideSegmentedTour run steps={[]} onSegmentComplete={onSegmentComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "End segment" }));

    expect(tourMocks.completeTour).toHaveBeenCalledOnce();
    expect(tourMocks.completeCurrentSegment).not.toHaveBeenCalled();
    expect(onSegmentComplete).not.toHaveBeenCalled();
  });

  it("completes the whole tour when it is skipped", () => {
    tourMocks.status = "skipped";
    render(<JoyrideSegmentedTour run steps={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "End segment" }));

    expect(tourMocks.completeTour).toHaveBeenCalledOnce();
    expect(tourMocks.completeCurrentSegment).not.toHaveBeenCalled();
  });
});
