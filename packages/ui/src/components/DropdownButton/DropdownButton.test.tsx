import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownButton } from "./DropdownButton";

describe("DropdownButton", () => {
  it("renders children on main button", () => {
    render(
      <DropdownButton onClick={() => {}} content={<div>Menu</div>}>
        Save
      </DropdownButton>,
    );
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("renders dropdown trigger with aria label", () => {
    render(<DropdownButton content={<div>Menu</div>}>Save</DropdownButton>);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("calls onClick when main button is clicked", () => {
    const handleClick = vi.fn();
    render(
      <DropdownButton onClick={handleClick} content={<div>Menu</div>}>
        Click
      </DropdownButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: /click/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("opens dropdown content from trigger", async () => {
    render(<DropdownButton content={<div>Dropdown item</div>}>Open</DropdownButton>);
    fireEvent.pointerDown(screen.getByLabelText("Open menu"));
    expect(await screen.findByText("Dropdown item")).toBeInTheDocument();
  });
});
