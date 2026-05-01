import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

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
