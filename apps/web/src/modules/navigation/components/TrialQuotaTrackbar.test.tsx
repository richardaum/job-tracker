import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrialQuotaTrackbar } from "./TrialQuotaTrackbar";

describe("TrialQuotaTrackbar", () => {
  it("renders with correct used/limit values when quota is available", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={10} trialCallsLimit={50} />);

    expect(screen.getByText("AI Trial")).toBeInTheDocument();
    expect(screen.getByText("10/50")).toBeInTheDocument();
  });

  it("shows correct used/limit values when one call remains", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={49} trialCallsLimit={50} />);

    expect(screen.getByText("49/50")).toBeInTheDocument();
  });

  it("shows correct used/limit values when all calls are used", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={50} trialCallsLimit={50} />);

    expect(screen.getByText("50/50")).toBeInTheDocument();
  });

  it("handles edge case where trialCallsUsed exceeds trialCallsLimit", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={60} trialCallsLimit={50} />);

    expect(screen.getByText("60/50")).toBeInTheDocument();
  });

  it("calculates correct progress bar width at zero usage", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={0} trialCallsLimit={50} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveStyle("width: 0%");
  });

  it("calculates correct progress bar width at 50% usage", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={25} trialCallsLimit={50} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveStyle("width: 50%");
  });

  it("calculates correct progress bar width at 100% usage", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={50} trialCallsLimit={50} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveStyle("width: 100%");
  });

  it("applies success color when usage is below 80%", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={30} trialCallsLimit={50} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-border-success");
  });

  it("applies warning color when usage is between 80% and 100%", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={40} trialCallsLimit={50} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-border-warning");
  });

  it("applies error color when usage is 100%", () => {
    render(<TrialQuotaTrackbar trialCallsUsed={50} trialCallsLimit={50} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("bg-border-error");
  });
});
