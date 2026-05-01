import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("renders a textbox", () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onChange handler", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
