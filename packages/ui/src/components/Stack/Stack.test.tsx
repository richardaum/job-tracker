import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

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
      <Stack direction="row" gap="xs">
        one
      </Stack>,
    );
    expect(screen.getByText("one")).toBeInTheDocument();
  });
});
