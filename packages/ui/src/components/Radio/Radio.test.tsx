import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Radio } from "./Radio";

const options = [
  { label: "Full-time", value: "fulltime" },
  { label: "Part-time", value: "parttime" },
];

describe("Radio", () => {
  it("renders all options", () => {
    render(<Radio options={options} />);
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText("Part-time")).toBeInTheDocument();
  });

  it("renders with horizontal orientation by default", () => {
    render(<Radio options={options} />);
    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup.className).toContain("flex-row");
  });

  it("renders with vertical orientation", () => {
    render(<Radio options={options} orientation="vertical" />);
    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup.className).toContain("flex-col");
  });

  it("calls onValueChange when an option is selected", () => {
    const handleChange = vi.fn();
    render(<Radio options={options} onValueChange={handleChange} />);
    fireEvent.click(screen.getByText("Full-time"));
    expect(handleChange).toHaveBeenCalledWith("fulltime");
  });

  it("respects default value", () => {
    render(<Radio options={options} defaultValue="parttime" />);
    const partTime = screen.getByText("Part-time");
    expect(partTime).toBeInTheDocument();
  });
});
