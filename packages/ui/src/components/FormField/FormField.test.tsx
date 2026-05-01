import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Input } from "../Input/Input";
import { FormField } from "./FormField";

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
