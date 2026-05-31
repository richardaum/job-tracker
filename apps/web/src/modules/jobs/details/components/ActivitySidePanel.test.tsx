import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActivitySidePanel } from "./ActivitySidePanel";

vi.mock("@/modules/jobs/details/components/NotesPanel", () => ({
  NotesPanelTabsContent: () => <div data-testid="notes-panel" />,
}));

vi.mock("@/modules/jobs/details/components/HistoryPanel", () => ({
  HistoryPanelTabsContent: () => <div data-testid="history-panel" />,
}));

describe("ActivitySidePanel", () => {
  it("links expand control to notes focus full page", () => {
    render(<ActivitySidePanel jobId="job-42" sidePanel="notes" onSidePanelChange={vi.fn()} />);

    const expandLink = screen.getByRole("link", { name: "Open full page" });
    expect(expandLink).toHaveAttribute("href", "/jobs/job-42/notes/focus");
  });

  it("calls onSidePanelChange when History tab is selected", async () => {
    const user = userEvent.setup();
    const onSidePanelChange = vi.fn();

    render(
      <ActivitySidePanel jobId="job-42" sidePanel="notes" onSidePanelChange={onSidePanelChange} />,
    );

    await user.click(screen.getByRole("tab", { name: /history/i }));

    expect(onSidePanelChange).toHaveBeenCalledWith("history");
  });
});
