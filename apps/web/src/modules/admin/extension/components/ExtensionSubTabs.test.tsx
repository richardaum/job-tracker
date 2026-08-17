import { SlotsProvider } from "@job-tracker/react-slots";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";

const pushMock = vi.fn();
const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({ usePathname: () => usePathnameMock(), useRouter: () => ({ push: pushMock }) }));

import { ExtensionSubTabs } from "./ExtensionSubTabs";

function renderSubTabs() {
  return render(
    <SlotsProvider>
      <AdminSubtabsSlot.Slot />
      <ExtensionSubTabs />
    </SlotsProvider>,
  );
}

describe("ExtensionSubTabs", () => {
  it("marks Status active on /admin/extension/status", () => {
    usePathnameMock.mockReturnValue("/admin/extension/status");

    renderSubTabs();

    expect(screen.getByRole("tab", { name: "Status" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tab", { name: "Events" })).toHaveAttribute("data-state", "inactive");
  });

  it("marks Events active on /admin/extension/events", () => {
    usePathnameMock.mockReturnValue("/admin/extension/events");

    renderSubTabs();

    expect(screen.getByRole("tab", { name: "Events" })).toHaveAttribute("data-state", "active");
  });

  it("navigates to the events route when the Events tab is clicked", async () => {
    usePathnameMock.mockReturnValue("/admin/extension/status");
    const user = userEvent.setup();

    renderSubTabs();
    await user.click(screen.getByRole("tab", { name: "Events" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/extension/events");
  });
});
