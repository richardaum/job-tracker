import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./Heading";

describe("Heading", () => {
  it("renders as h2 by default", () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders the correct heading tag via `as` prop", () => {
    render(<Heading as="h1">Page Title</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("applies size class for explicit size", () => {
    render(<Heading size="xl">Section</Heading>);
    expect(screen.getByRole("heading")).toHaveClass("text-xl");
  });

  it("applies text-text-primary color class", () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole("heading")).toHaveClass("text-text-primary");
  });

  it("passes extra className", () => {
    render(<Heading className="custom">Title</Heading>);
    expect(screen.getByRole("heading")).toHaveClass("custom");
  });
});
