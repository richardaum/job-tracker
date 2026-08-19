import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders placeholder", () => {
    render(<SearchInput placeholder="Search jobs" />);
    expect(screen.getByPlaceholderText("Search jobs")).toBeInTheDocument();
  });

  it("renders shortcut hint when provided", () => {
    render(<SearchInput placeholder="Search" shortcutHint="⌘K" />);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("focuses the input with Command or Control + /", () => {
    render(<SearchInput placeholder="Search" shortcutHint="⌘/" />);
    const input = screen.getByPlaceholderText("Search");

    fireEvent.keyDown(window, { code: "Slash", metaKey: true });
    expect(input).toHaveFocus();
  });

  it("does not render shortcut hint when null", () => {
    render(<SearchInput placeholder="Search" shortcutHint={null} />);
    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
  });

  it("calls onChange when interactive", () => {
    const handleChange = vi.fn();
    render(<SearchInput placeholder="Search" value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("uses ariaLabel when provided", () => {
    render(<SearchInput placeholder="Search" ariaLabel="Custom label" />);
    expect(screen.getByLabelText("Custom label")).toBeInTheDocument();
  });
});
