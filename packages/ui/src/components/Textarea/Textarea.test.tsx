import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders textarea element", () => {
    render(<Textarea placeholder="Add notes" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("supports custom rows", () => {
    render(<Textarea rows={6} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "6");
  });
});
