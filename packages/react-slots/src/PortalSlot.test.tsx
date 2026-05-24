import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalSlot } from "./PortalSlot";
import { PortalSlotsProvider } from "./PortalSlotsProvider";

describe("PortalSlot", () => {
  const TestPortal = PortalSlot("portal-test");

  it("Fill portals content into Slot mount point", () => {
    render(
      <PortalSlotsProvider>
        <TestPortal.Slot data-testid="portal-target" />
        <TestPortal>
          <button type="button">Portaled</button>
        </TestPortal>
      </PortalSlotsProvider>,
    );

    expect(screen.getByTestId("portal-target")).toContainElement(
      screen.getByRole("button", { name: "Portaled" }),
    );
  });

  it("Fill without provider throws", () => {
    const UnscopedPortal = PortalSlot("no-provider");

    expect(() =>
      render(
        <UnscopedPortal>
          <span>content</span>
        </UnscopedPortal>,
      ),
    ).toThrow(/PortalSlot must be used within a SlotsProvider/);
  });
});
