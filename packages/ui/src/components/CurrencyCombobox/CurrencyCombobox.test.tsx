import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CurrencyCombobox } from "./CurrencyCombobox";

describe("CurrencyCombobox", () => {
  it("renders input with placeholder", () => {
    render(<CurrencyCombobox value="" onValueChange={vi.fn()} placeholder="Currency" />);
    expect(screen.getByPlaceholderText("Currency")).toBeInTheDocument();
  });

  it("shows current value", () => {
    render(<CurrencyCombobox value="USD" onValueChange={vi.fn()} />);
    expect(screen.getByDisplayValue("USD")).toBeInTheDocument();
  });

  it("calls onValueChange when user types", () => {
    const handleChange = vi.fn();
    render(<CurrencyCombobox value="" onValueChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "EUR" } });
    expect(handleChange).toHaveBeenCalledWith("EUR");
  });

  it("normalizes input to uppercase", () => {
    const handleChange = vi.fn();
    render(<CurrencyCombobox value="" onValueChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "eur" } });
    expect(handleChange).toHaveBeenCalledWith("EUR");
  });

  it("calls onBlur when input loses focus", () => {
    const handleBlur = vi.fn();
    render(<CurrencyCombobox value="USD" onValueChange={vi.fn()} onBlur={handleBlur} />);
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });
});
