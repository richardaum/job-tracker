import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("renders label content", () => {
    render(<Label htmlFor="email">Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows required marker when required", () => {
    render(<Label required>Password</Label>);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
