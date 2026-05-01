import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Separator } from "./Separator";

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    render(<Separator />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("renders a vertical separator when configured", () => {
    render(<Separator orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });
});
