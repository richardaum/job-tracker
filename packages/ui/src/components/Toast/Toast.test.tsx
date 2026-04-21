import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("opens from trigger and closes from close button", () => {
    render(
      <Toast
        trigger={<button type="button">Show toast</button>}
        title="Saved"
        description="Your changes were saved."
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show toast/i }));
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close toast/i }));
    expect(
      screen.queryByText("Your changes were saved."),
    ).not.toBeInTheDocument();
  });

  it("calls action callback when action is clicked", () => {
    const onAction = vi.fn();

    render(
      <Toast
        trigger={<button type="button">Show toast</button>}
        title="Undo delete"
        actionLabel="Undo"
        onAction={onAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show toast/i }));
    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
