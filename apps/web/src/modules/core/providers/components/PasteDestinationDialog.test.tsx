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

  it("defaults auto-fill checkbox to autoFillEnabled from preloaded settings", () => {
    useSettingsQueryMock.mockReturnValue({
      data: {
        settings: {
          autoFillEnabled: true,
          autoSummaryEnabled: false,
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
    ).toBeChecked();
    expect(useSettingsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: "cache-first" }),
    );
  });

  it("defaults auto-fill checkbox to unchecked when setting is off", () => {
    useSettingsQueryMock.mockReturnValue({
      data: {
        settings: {
          autoFillEnabled: false,
          autoSummaryEnabled: false,
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
  });

  it("passes toggled auto-fill value to onConfirm", async () => {
    useSettingsQueryMock.mockReturnValue({
      data: {
        settings: {
          autoFillEnabled: true,
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

    const checkbox = screen.getByRole("checkbox", {
      name: "Fill job fields automatically",
    });
    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: "Create draft" }));

    expect(onConfirm).toHaveBeenCalledWith("", false);
  });
});
