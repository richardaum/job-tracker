import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders alert content", () => {
    render(<Alert title="Heads up">Profile updated.</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
  });

  it("applies error styles when intent is error", () => {
    render(<Alert intent="error">Something failed.</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("border-border-error");
  });
});
