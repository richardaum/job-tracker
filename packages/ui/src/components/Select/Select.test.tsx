import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

    expect(screen.getByRole("combobox", { name: "Choose stage" })).toBeInTheDocument();
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

  it("stays controlled when value starts undefined and a selection is made", () => {
    const onValueChange = vi.fn();
    function ControlledSelect() {
      const [value, setValue] = useState<string | undefined>(undefined);
      return (
        <Select
          placeholder="Choose stage"
          value={value}
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            setValue(nextValue);
          }}
          options={[
            { label: "Applied", value: "applied" },
            { label: "Offer", value: "offer" },
          ]}
        />
      );
    }

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ControlledSelect />);

    fireEvent.click(screen.getByRole("combobox", { name: "Choose stage" }));
    fireEvent.click(screen.getByText("Offer"));

    expect(onValueChange).toHaveBeenCalledWith("offer");
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Select is changing from uncontrolled to controlled"),
    );

    errorSpy.mockRestore();
  });
});
