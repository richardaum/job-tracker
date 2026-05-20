import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchStatusBadge } from "./MatchStatusBadge";

describe("MatchStatusBadge", () => {
  it("renders status label", () => {
    render(<MatchStatusBadge status="PROCESSING" />);
    expect(screen.getByText("Processing")).toBeDefined();
  });

  it("does not show error text directly when FAILED", () => {
    const error = "Something went wrong";
    render(<MatchStatusBadge status="FAILED" error={error} />);

    // Should NOT find the error text in the document as a visible element
    // (It might be in the DOM via Tooltip portal but shouldn't be a simple span anymore)
    const errorElement = screen.queryByText(error);
    expect(errorElement).toBeNull();
  });
});
