import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders badge text", () => {
    render(<Badge>Interview</Badge>);
    expect(screen.getByText(/interview/i)).toBeInTheDocument();
  });

  it("applies success intent styles", () => {
    render(<Badge intent="success">Accepted</Badge>);
    const el = screen.getByText(/accepted/i);
    expect(el.className).toContain("bg-bg-success-subtle");
    expect(el.className).toContain("primitive-color-green-700");
  });
});
