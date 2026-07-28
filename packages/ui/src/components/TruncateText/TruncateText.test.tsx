import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TruncateText } from "./TruncateText";

describe("TruncateText", () => {
  it("renders children text", () => {
    render(<TruncateText>Short text</TruncateText>);
    expect(screen.getByText("Short text")).toBeInTheDocument();
  });

  it("applies truncate class", () => {
    render(<TruncateText>Truncated</TruncateText>);
    expect(screen.getByText("Truncated").className).toContain("truncate");
  });
});
