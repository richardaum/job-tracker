import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterChip } from "./FilterChip";

describe("FilterChip", () => {
  it("renders children", () => {
    render(<FilterChip>Remote</FilterChip>);
    expect(screen.getByRole("button", { name: /remote/i })).toBeInTheDocument();
  });

  it("renders active class when active", () => {
    render(<FilterChip active>Active</FilterChip>);
    const chip = screen.getByRole("button", { name: /active/i });
    expect(chip.className).toContain("bg-bg-brand-strong");
    expect(chip.className).toContain("text-text-inverted");
  });

  it("renders inactive classes by default", () => {
    render(<FilterChip>Inactive</FilterChip>);
    const chip = screen.getByRole("button", { name: /inactive/i });
    expect(chip.className).toContain("bg-bg-surface");
    expect(chip.className).toContain("text-text-secondary");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<FilterChip onClick={handleClick}>Clickable</FilterChip>);
    fireEvent.click(screen.getByRole("button", { name: /clickable/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
