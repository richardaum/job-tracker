import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with pulse animation", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("animate-pulse");
  });

  it("supports circle variant", () => {
    render(<Skeleton variant="circle" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("rounded-full");
  });
});
