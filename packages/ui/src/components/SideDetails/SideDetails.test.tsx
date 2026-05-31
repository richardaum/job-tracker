import { fireEvent, render, screen } from "@testing-library/react";
import { cn } from "@ui/lib/cn";
import React, { useState } from "react";
import { describe, expect, it } from "vitest";

import { SideDetails } from "./SideDetails";

function ControlledHarness({
  accessibilityTitle,
  title,
}: {
  accessibilityTitle?: string;
  title?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <SideDetails
        open={open}
        onOpenChange={setOpen}
        title={title}
        accessibilityTitle={accessibilityTitle}
      >
        <p>Side body</p>
      </SideDetails>
    </>
  );
}

function OpenViaButtonHarness({
  accessibilityTitle,
  title,
}: {
  accessibilityTitle?: string;
  title?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <SideDetails
        open={open}
        onOpenChange={setOpen}
        title={title}
        accessibilityTitle={accessibilityTitle}
      >
        <p>Side body</p>
      </SideDetails>
    </>
  );
}

describe("SideDetails overlay", () => {
  it("closes from the Close control", () => {
    render(<ControlledHarness title="Importer" />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Side body")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close side panel/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^open$/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<ControlledHarness title="Importer" />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports an accessibility-only title via accessibilityTitle when no visible title", () => {
    render(<OpenViaButtonHarness accessibilityTitle="Custom a11y" />);

    fireEvent.click(screen.getByRole("button", { name: /^open$/i }));

    expect(screen.getByRole("dialog", { name: "Custom a11y" })).toBeInTheDocument();
  });
});

function InlineControlledHarness({ title }: { title?: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open inline
      </button>
      <div className={cn("flex min-h-40 flex-row")}>
        <SideDetails layout="inline" open={open} onOpenChange={setOpen} title={title}>
          <p>Inline body</p>
        </SideDetails>
      </div>
    </>
  );
}

describe("SideDetails inline", () => {
  it("does not render a dialog; uses complementary landmark beside the layout", () => {
    render(<InlineControlledHarness title="Pane title" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /pane title/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close side panel/i }));

    expect(screen.queryByRole("complementary", { name: /pane title/i })).not.toBeInTheDocument();
  });

  it("does not intercept Escape globally", () => {
    render(<InlineControlledHarness title="Importer" />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.getByRole("complementary", { name: /importer/i })).toBeInTheDocument();
  });
});
