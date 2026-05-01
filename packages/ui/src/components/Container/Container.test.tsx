import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Container } from "./Container";

describe("Container", () => {
  it("renders children content", () => {
    render(<Container>Inner content</Container>);
    expect(screen.getByText("Inner content")).toBeInTheDocument();
  });

  it("renders container content consistently", () => {
    render(<Container>Inner content</Container>);
    expect(screen.getAllByText("Inner content")).toHaveLength(1);
  });
});
