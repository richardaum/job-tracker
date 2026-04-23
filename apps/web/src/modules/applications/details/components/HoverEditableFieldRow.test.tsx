import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldEditTriggerButton } from "./HoverEditableFieldRow";

describe("FieldEditTriggerButton", () => {
  it("forwards click handlers to the button element", () => {
    const onClick = vi.fn();

    render(<FieldEditTriggerButton label="Edit title" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit title" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
