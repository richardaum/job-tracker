import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileShell } from "./ProfileShell";
import { AiProfileSubTabs } from "@/modules/profile/ai/components/AiProfileSubTabs";

const pushMock = vi.fn();
const pathnameMock = vi.fn(() => "/profile");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock(),
  useSearchParams: () => new URLSearchParams(),
}));

function renderShell(pathname: string, child = <div data-testid="child-content" />) {
  pathnameMock.mockReturnValue(pathname);
  return render(<ProfileShell>{child}</ProfileShell>);
}

describe("ProfileShell", () => {
  it("renders all primary tab triggers", () => {
    renderShell("/profile");
    expect(screen.getByRole("tab", { name: "Identity" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "AI Usage" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resumes" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Work Preferences" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Blocked Keywords" })).toBeInTheDocument();
  });

  it("active tab matches current pathname — /profile selects Identity", () => {
    renderShell("/profile");
    const tab = screen.getByRole("tab", { name: "Identity" });
    expect(tab).toHaveAttribute("data-state", "active");
  });

  it("active tab matches the legacy settings pathname", () => {
    renderShell("/profile/settings");
    const tab = screen.getByRole("tab", { name: "Settings" });
    expect(tab).toHaveAttribute("data-state", "active");
  });

  it("active tab matches current pathname — /profile/resumes selects Resumes", () => {
    renderShell("/profile/resumes");
    const tab = screen.getByRole("tab", { name: "Resumes" });
    expect(tab).toHaveAttribute("data-state", "active");
  });

  it("active tab matches current pathname — /profile/preferences selects Work Preferences", () => {
    renderShell("/profile/preferences");
    const tab = screen.getByRole("tab", { name: "Work Preferences" });
    expect(tab).toHaveAttribute("data-state", "active");
  });

  it("routes the AI primary tab to Usage", async () => {
    const user = userEvent.setup();
    const { unmount } = renderShell("/profile/ai-usage");

    const tab = screen.getByRole("tab", { name: "AI Usage" });
    expect(tab).toHaveAttribute("data-state", "active");

    unmount();
    renderShell("/profile");
    await user.click(screen.getByRole("tab", { name: "AI Usage" }));
    expect(pushMock).toHaveBeenCalledWith("/profile/ai-usage");
  });

  it("renders AI subtabs through the profile slot", async () => {
    const user = userEvent.setup();
    renderShell("/profile/ai/usage", <AiProfileSubTabs activeTab="usage" />);
    const subTabs = screen.getAllByRole("tablist")[1];

    expect(within(subTabs).getByRole("tab", { name: "Usage" })).toHaveAttribute("data-state", "active");
    expect(within(subTabs).getByRole("tab", { name: "Settings" })).toBeInTheDocument();

    await user.click(within(subTabs).getByRole("tab", { name: "Settings" }));
    expect(pushMock).toHaveBeenCalledWith("/profile/ai/settings");
  });

  it("clicking tab calls router.push to correct subpage", async () => {
    const user = userEvent.setup();
    renderShell("/profile");

    await user.click(screen.getByRole("tab", { name: "Resumes" }));
    expect(pushMock).toHaveBeenCalledWith("/profile/resumes");

    pushMock.mockClear();
    await user.click(screen.getByRole("tab", { name: "Work Preferences" }));
    expect(pushMock).toHaveBeenCalledWith("/profile/preferences");
  });

  it("clicking Identity tab navigates to /profile", async () => {
    const user = userEvent.setup();
    renderShell("/profile/settings");

    await user.click(screen.getByRole("tab", { name: "Identity" }));
    expect(pushMock).toHaveBeenCalledWith("/profile");
  });

  it("renders children inside the shell", () => {
    renderShell("/profile");
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders heading and back link", () => {
    renderShell("/profile");
    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to jobs/i })).toHaveAttribute("href", "/jobs");
  });
});
