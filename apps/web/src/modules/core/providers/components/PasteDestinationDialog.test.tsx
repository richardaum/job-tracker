import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasteDestinationDialog } from "./PasteDestinationDialog";

const useSettingsQueryMock = vi.fn();

vi.mock("@/gql/hooks", () => ({
  useSettingsQuery: (...args: unknown[]) => useSettingsQueryMock(...args),
}));

describe("PasteDestinationDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults after-create checkboxes to settings", () => {
    useSettingsQueryMock.mockReturnValue({
      data: {
        settings: {
          autoFillEnabled: true,
          autoSummaryEnabled: false,
          autoMatchEnabled: true,
          duplicateWindowDays: 30,
        },
      },
    });

    render(
      <PasteDestinationDialog
        open
        pastedContent="<p>Job description</p>"
        onOpenChange={vi.fn()}
        onConfirm={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Fill job fields automatically" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Run match analysis" })).toBeChecked();
    expect(screen.getByText("After create:")).toBeInTheDocument();
    expect(useSettingsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: "cache-first" }),
    );
  });

  it("defaults after-create checkboxes to unchecked when settings are off", () => {
    useSettingsQueryMock.mockReturnValue({
      data: {
        settings: {
          autoFillEnabled: false,
          autoSummaryEnabled: false,
          autoMatchEnabled: false,
          duplicateWindowDays: 30,
        },
      },
    });

    render(
      <PasteDestinationDialog
        open
        pastedContent="<p>Job description</p>"
        onOpenChange={vi.fn()}
        onConfirm={vi.fn(async () => {})}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Fill job fields automatically" }),
    ).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Run match analysis" })).not.toBeChecked();
  });

  it("passes toggled after-create values to onConfirm", async () => {
    useSettingsQueryMock.mockReturnValue({
      data: {
        settings: {
          autoFillEnabled: true,
          autoMatchEnabled: true,
          autoSummaryEnabled: false,
          duplicateWindowDays: 30,
        },
      },
    });

    const onConfirm = vi.fn(async () => {});
    const user = userEvent.setup();

    render(
      <PasteDestinationDialog
        open
        pastedContent="<p>Job description</p>"
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Fill job fields automatically" }));
    await user.click(screen.getByRole("checkbox", { name: "Run match analysis" }));
    await user.click(screen.getByRole("button", { name: "Create draft" }));

    expect(onConfirm).toHaveBeenCalledWith("", {
      autoFill: false,
      autoMatch: false,
    });
  });
});
