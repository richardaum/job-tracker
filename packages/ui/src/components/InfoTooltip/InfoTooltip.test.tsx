import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfoTooltip } from "./InfoTooltip";

describe("InfoTooltip", () => {
  it("renders tooltip trigger icon", () => {
    render(<InfoTooltip content="Helpful information" />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("renders tooltip icon inside the span", () => {
    render(<InfoTooltip content="Info" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.innerHTML).toContain("svg");
  });
});
