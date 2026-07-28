import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Combobox } from "./Combobox";

const options = [
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
];

describe("Combobox", () => {
  it("renders input with placeholder", () => {
    render(
      <Combobox
        options={options}
        value=""
        onInputValueChange={vi.fn()}
        onValueChange={vi.fn()}
        placeholder="Select stage"
      />,
    );
    expect(screen.getByPlaceholderText("Select stage")).toBeInTheDocument();
  });

  it("shows selected label when value matches an option", () => {
    render(<Combobox options={options} value="interview" onInputValueChange={vi.fn()} onValueChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Interview")).toBeInTheDocument();
  });

  it("shows raw value when value does not match any option", () => {
    render(<Combobox options={options} value="Custom value" onInputValueChange={vi.fn()} onValueChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Custom value")).toBeInTheDocument();
  });

  it("calls onInputValueChange when user types", () => {
    const handleInputChange = vi.fn();
    render(<Combobox options={options} value="" onInputValueChange={handleInputChange} onValueChange={vi.fn()} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "App" } });
    expect(handleInputChange).toHaveBeenCalledWith("App");
  });
});
