import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "./FormField";
import { Input } from "../Input/Input";

describe("FormField", () => {
  it("renders label and input", () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(
      <FormField label="Email" htmlFor="email" error="Invalid email">
        <Input id="email" state="error" />
      </FormField>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });
});
