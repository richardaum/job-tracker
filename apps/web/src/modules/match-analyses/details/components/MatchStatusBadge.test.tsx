import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AsyncMetadataStatus } from "@/gql/hooks";

import { MatchStatusBadge } from "./MatchStatusBadge";

function getStatusBadge() {
  return document.querySelector(
    '[data-testid="match-status-badge"]',
  ) as HTMLElement;
}

describe("MatchStatusBadge", () => {
  it("renders a status dot without visible label text", () => {
    render(<MatchStatusBadge status={AsyncMetadataStatus.Processing} />);

    expect(getStatusBadge()).toBeTruthy();
    expect(screen.queryByText(/.+/)).toBeNull();
  });

  it("applies warning color class for PROCESSING", () => {
    render(<MatchStatusBadge status={AsyncMetadataStatus.Processing} />);

    expect(getStatusBadge()).toHaveClass("bg-text-warning");
  });

  it("pulses opacity while PROCESSING", () => {
    render(<MatchStatusBadge status={AsyncMetadataStatus.Processing} />);

    expect(getStatusBadge()).toHaveClass("animate-match-status-pulse");
  });

  it("does not pulse when COMPLETED", () => {
    render(<MatchStatusBadge status={AsyncMetadataStatus.Completed} />);

    expect(getStatusBadge()).not.toHaveClass("animate-match-status-pulse");
  });

  it("applies success color class for COMPLETED", () => {
    render(<MatchStatusBadge status={AsyncMetadataStatus.Completed} />);

    expect(getStatusBadge()).toHaveClass("bg-text-success");
  });

  it("applies error color class for FAILED", () => {
    render(<MatchStatusBadge status={AsyncMetadataStatus.Failed} />);

    expect(getStatusBadge()).toHaveClass("bg-text-error");
  });
});
