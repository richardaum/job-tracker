import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("invokes onConfirm and closes when confirm succeeds", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmDialog
        trigger={<button type="button">Open</button>}
        title="Remove item"
        description="This cannot be undone."
        confirmLabel="Remove"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText("This cannot be undone.")).not.toBeInTheDocument());
  });

  it("stays open when onConfirm rejects", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("fail"));

    render(
      <ConfirmDialog
        trigger={<button type="button">Open</button>}
        title="Remove item"
        description="This cannot be undone."
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("calls onOpenChange when closing from cancel", () => {
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        trigger={<button type="button">Open</button>}
        title="Title"
        description="Body"
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
