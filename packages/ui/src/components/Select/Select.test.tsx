import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Select } from "./Select";

describe("Select", () => {
  it("renders placeholder trigger", () => {
    render(
      <Select
        placeholder="Choose stage"
        options={[
          { label: "Applied", value: "applied" },
          { label: "Interview", value: "interview" },
        ]}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Choose stage" }),
    ).toBeInTheDocument();
  });

  it("opens options list", () => {
    render(
      <Select
        placeholder="Choose stage"
        options={[
          { label: "Applied", value: "applied" },
          { label: "Interview", value: "interview" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Choose stage" }));
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });
});
