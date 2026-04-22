import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("renders as p by default", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("P");
  });

  it("renders as span when `as` is span", () => {
    render(<Text as="span">Inline</Text>);
    expect(screen.getByText("Inline").tagName).toBe("SPAN");
  });

  it("applies size class", () => {
    render(<Text size="sm">Small</Text>);
    expect(screen.getByText("Small")).toHaveClass("text-sm");
  });

  it("applies weight class", () => {
    render(<Text weight="semibold">Bold text</Text>);
    expect(screen.getByText("Bold text")).toHaveClass("font-semibold");
  });

  it("applies color class for secondary", () => {
    render(<Text color="secondary">Hint</Text>);
    expect(screen.getByText("Hint")).toHaveClass("text-text-secondary");
  });

  it("defaults to primary color", () => {
    render(<Text>Default</Text>);
    expect(screen.getByText("Default")).toHaveClass("text-text-primary");
  });

  it("passes extra className", () => {
    render(<Text className="custom">Text</Text>);
    expect(screen.getByText("Text")).toHaveClass("custom");
  });
});
