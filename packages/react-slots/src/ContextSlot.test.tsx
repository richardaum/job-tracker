import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { ContextSlot } from "./ContextSlot";
import { ContextSlotsProvider } from "./ContextSlotsProvider";

function renderWithProvider(ui: ReactElement) {
  return render(<ContextSlotsProvider>{ui}</ContextSlotsProvider>);
}

describe("ContextSlot", () => {
  const TestSlot = ContextSlot("test");

  it("Fill registers → Slot renders content", () => {
    renderWithProvider(
      <>
        <TestSlot>Hello slot</TestSlot>
        <TestSlot.Slot />
      </>,
    );

    expect(screen.getByText("Hello slot")).toBeInTheDocument();
  });

  it("Fill unmount → Slot returns null", () => {
    const { rerender } = renderWithProvider(
      <>
        <TestSlot>Hello slot</TestSlot>
        <TestSlot.Slot />
      </>,
    );

    expect(screen.getByText("Hello slot")).toBeInTheDocument();

    rerender(
      <ContextSlotsProvider>
        <TestSlot.Slot />
      </ContextSlotsProvider>,
    );

    expect(screen.queryByText("Hello slot")).not.toBeInTheDocument();
  });

  it("Fill without provider throws", () => {
    const UnscopedSlot = ContextSlot("no-provider");

    expect(() => render(<UnscopedSlot>content</UnscopedSlot>)).toThrow(
      /ContextSlot must be used within a SlotsProvider/,
    );
  });

  it("two Fill components mounted simultaneously for same slot — last registered wins", () => {
    renderWithProvider(
      <>
        <TestSlot>First</TestSlot>
        <TestSlot>Second</TestSlot>
        <TestSlot.Slot />
      </>,
    );

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("Fill unmount does not clear a newer Fill for the same slot", () => {
    function Scenario({ showFirst }: { showFirst: boolean }) {
      return (
        <ContextSlotsProvider>
          {showFirst ? <TestSlot>First</TestSlot> : null}
          <TestSlot>Second</TestSlot>
          <TestSlot.Slot />
        </ContextSlotsProvider>
      );
    }

    const { rerender } = render(<Scenario showFirst />);
    expect(screen.getByText("Second")).toBeInTheDocument();

    rerender(<Scenario showFirst={false} />);
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("Two sequential Fills → last wins", () => {
    const { rerender } = renderWithProvider(
      <>
        <TestSlot>First</TestSlot>
        <TestSlot.Slot />
      </>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();

    rerender(
      <ContextSlotsProvider>
        <TestSlot>Second</TestSlot>
        <TestSlot.Slot />
      </ContextSlotsProvider>,
    );

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
