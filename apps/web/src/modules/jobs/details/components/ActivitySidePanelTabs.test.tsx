import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabsTrigger } from "@job-tracker/ui";
import { describe, expect, it, vi } from "vitest";

import { ActivitySidePanelTabs } from "./ActivitySidePanelTabs";
import { NotesSideTabTrigger } from "./NotesSideTabTrigger";

describe("ActivitySidePanelTabs", () => {
  it("calls onSidePanelChange when History tab is selected", async () => {
    const user = userEvent.setup();
    const onSidePanelChange = vi.fn();

    render(
      <ActivitySidePanelTabs
        sidePanel="notes"
        onSidePanelChange={onSidePanelChange}
        tabs={{
          notes: { trigger: <NotesSideTabTrigger jobId="job-42" />, content: <div data-testid="notes-panel" /> },
          history: {
            trigger: <TabsTrigger value="history">History</TabsTrigger>,
            content: <div data-testid="history-panel" />,
          },
          chat: { trigger: <TabsTrigger value="chat">Chat</TabsTrigger>, content: <div data-testid="chat-panel" /> },
        }}
      />,
    );

    await user.click(screen.getByRole("tab", { name: /history/i }));

    expect(onSidePanelChange).toHaveBeenCalledWith("history");
  });
});
