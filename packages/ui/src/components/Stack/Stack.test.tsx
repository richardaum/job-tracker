import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders children content", () => {
    render(
      <Stack>
        <span>one</span>
        <span>two</span>
      </Stack>,
    );
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("supports direction and gap props", () => {
    render(
      <Stack direction="row" gap="inline">
        one
      </Stack>,
    );
    expect(screen.getByText("one")).toBeInTheDocument();
  });
});
