import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FieldWithLabelAction, FieldWithLabelActionIconActionButton, FieldWithLabelActionTooltip } from "./index";

describe("FieldWithLabelAction", () => {
  it("renders label and content", () => {
    render(<FieldWithLabelAction label="Email" content="user@example.com" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(<FieldWithLabelAction label="Name" content="John" actions={<button type="button">Edit</button>} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("renders multiple actions", () => {
    render(
      <FieldWithLabelAction
        label="Tags"
        content="dev"
        actions={[
          <button key="1" type="button">
            Add
          </button>,
          <button key="2" type="button">
            Remove
          </button>,
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  it("renders Tooltip subcomponent via actions", () => {
    render(
      <FieldWithLabelAction
        label="Field"
        content="value"
        actions={
          <FieldWithLabelAction.Tooltip content="Tooltip text">
            <span>Hover me</span>
          </FieldWithLabelAction.Tooltip>
        }
      />,
    );
    expect(screen.getByText("Field")).toBeInTheDocument();
  });

  it("renders IconActionButton subcomponent via actions", () => {
    const handleClick = vi.fn();
    render(
      <FieldWithLabelAction
        label="Edit"
        content="value"
        actions={
          <FieldWithLabelAction.IconActionButton
            label="Edit item"
            icon={<span data-testid="icon">E</span>}
            onClick={handleClick}
          />
        }
      />,
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});

describe("FieldWithLabelActionTooltip", () => {
  it("renders with default side", () => {
    render(
      <FieldWithLabelActionTooltip content="Help">
        <span>Trigger</span>
      </FieldWithLabelActionTooltip>,
    );
    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });
});

describe("FieldWithLabelActionIconActionButton", () => {
  it("renders with label and tooltip", () => {
    render(<FieldWithLabelActionIconActionButton label="Delete" icon={<span>X</span>} />);
    expect(screen.getByLabelText("Delete")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<FieldWithLabelActionIconActionButton label="Edit" icon={<span>E</span>} onClick={handleClick} />);
    fireEvent.click(screen.getByLabelText("Edit"));
    expect(handleClick).toHaveBeenCalled();
  });
});
