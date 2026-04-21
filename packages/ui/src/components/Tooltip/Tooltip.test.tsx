import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders tooltip content when open", async () => {
    render(
      <Tooltip content="Tooltip content" defaultOpen>
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("notifies open state on focus", () => {
    const handleOpenChange = vi.fn();

    render(
      <Tooltip content="Tooltip content" onOpenChange={handleOpenChange}>
        <button type="button">Focus me</button>
      </Tooltip>,
    );

    fireEvent.focus(screen.getByRole("button", { name: /focus me/i }));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes on escape key when open", () => {
    render(
      <Tooltip content="Tooltip content" defaultOpen>
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
