import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
    expect(screen.queryByText("Your changes were saved.")).not.toBeInTheDocument();
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

  it("renders multiple stacked toasts from queue input", () => {
    render(
      <Toast
        toasts={[
          { id: "1", title: "First message", intent: "info" },
          { id: "2", title: "Second message", intent: "success" },
        ]}
      />,
    );

    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });

  it("forwards queue attributes and hides the progress bar for manual toasts", () => {
    const { container } = render(
      <Toast
        toasts={[
          { id: "1", title: "Created", lifetime: "manual", attrs: { "data-welcome-tour-step": "job-created-toast" } },
        ]}
      />,
    );

    expect(screen.getByText("Created").closest('[data-welcome-tour-step="job-created-toast"]')).toBeInTheDocument();
    expect(container.querySelector(".origin-left")).not.toBeInTheDocument();
  });
});
