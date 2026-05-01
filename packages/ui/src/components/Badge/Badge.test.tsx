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
    expect(screen.getByText(/accepted/i)).toHaveClass("text-text-success");
  });
});
