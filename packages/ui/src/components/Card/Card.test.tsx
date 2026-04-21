import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children content", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("supports variant and padding props", () => {
    render(
      <Card variant="outlined" padding="sm">
        Outlined
      </Card>,
    );
    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.getByText("Outlined")).toBeInTheDocument();
  });
});
