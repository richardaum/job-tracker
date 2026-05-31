import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("opens and closes from user actions", () => {
    render(
      <Dialog trigger={<button type="button">Open</button>} title="Dialog title">
        <p>Dialog content</p>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByText("Dialog content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close dialog/i }));
    expect(screen.queryByText("Dialog content")).not.toBeInTheDocument();
  });

  it("closes on escape key", () => {
    render(
      <Dialog defaultOpen trigger={<button type="button">Open</button>} title="Dialog title">
        <p>Dialog content</p>
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Dialog content")).not.toBeInTheDocument();
  });
});
