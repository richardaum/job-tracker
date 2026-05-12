import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FitStatusBadge } from "./FitStatusBadge";

describe("FitStatusBadge", () => {
  it("renders status label", () => {
    render(<FitStatusBadge status="PROCESSING" />);
    expect(screen.getByText("Processing")).toBeDefined();
  });

  it("does not show error text directly when FAILED", () => {
    const error = "Something went wrong";
    render(<FitStatusBadge status="FAILED" error={error} />);

    // Should NOT find the error text in the document as a visible element
    // (It might be in the DOM via Tooltip portal but shouldn't be a simple span anymore)
    const errorElement = screen.queryByText(error);
    expect(errorElement).toBeNull();
  });
});
