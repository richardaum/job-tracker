import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { ContextSlot } from "./ContextSlot";
import { PortalSlot } from "./index";
import { SlotsProvider } from "./SlotsProvider";

function renderWithSlotsProvider(ui: ReactElement) {
  return render(<SlotsProvider>{ui}</SlotsProvider>);
}

describe("SlotsProvider", () => {
  it("PortalSlot Fill + Slot work through SlotsProvider", () => {
    const TestPortal = PortalSlot("portal-test");

    renderWithSlotsProvider(
      <>
        <TestPortal.Slot data-testid="portal-slot" />
        <TestPortal>
          <button type="button">Portal action</button>
        </TestPortal>
      </>,
    );

    expect(screen.getByTestId("portal-slot")).toContainElement(screen.getByRole("button", { name: "Portal action" }));
  });

  it("ContextSlot Fill + Slot work through SlotsProvider", () => {
    const TestContext = ContextSlot("context-test");

    renderWithSlotsProvider(
      <>
        <TestContext>Context content</TestContext>
        <TestContext.Slot />
      </>,
    );

    expect(screen.getByText("Context content")).toBeInTheDocument();
  });

  it("both slot types work together without interference", () => {
    const TestPortal = PortalSlot("combined-portal");
    const TestContext = ContextSlot("combined-context");

    renderWithSlotsProvider(
      <>
        <TestPortal.Slot data-testid="portal-slot" />
        <TestContext.Slot />
        <TestPortal>
          <span>Portal only</span>
        </TestPortal>
        <TestContext>Context only</TestContext>
      </>,
    );

    expect(screen.getByTestId("portal-slot")).toContainElement(screen.getByText("Portal only"));
    expect(screen.getByText("Context only")).toBeInTheDocument();
  });
});
