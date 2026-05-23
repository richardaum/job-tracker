import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileShell } from "./ProfileShell";

const pushMock = vi.fn();
const pathnameMock = vi.fn(() => "/profile");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock(),
}));

function renderShell(pathname: string) {
  pathnameMock.mockReturnValue(pathname);
  return render(
    <ProfileShell>
      <div data-testid="child-content" />
    </ProfileShell>,
  );
}

describe("ProfileShell", () => {
  it("renders 4 tab triggers", () => {
    renderShell("/profile");
    expect(screen.getByRole("tab", { name: "Identity" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resumes" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Work Preferences" }),
    ).toBeInTheDocument();
  });

  it("active tab matches current pathname — /profile selects Identity", () => {
    renderShell("/profile");
    const tab = screen.getByRole("tab", { name: "Identity" });
    expect(tab).toHaveAttribute("data-state", "active");
  });

  it("active tab matches current pathname — /profile/settings selects Settings", () => {
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

  it("clicking tab calls router.push to correct subpage", async () => {
    const user = userEvent.setup();
    renderShell("/profile");

    await user.click(screen.getByRole("tab", { name: "Settings" }));
    expect(pushMock).toHaveBeenCalledWith("/profile/settings");

    pushMock.mockClear();
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

  it("/profile/resumes/[id] pathname highlights Resumes tab", () => {
    renderShell("/profile/resumes/res-123");
    const tab = screen.getByRole("tab", { name: "Resumes" });
    expect(tab).toHaveAttribute("data-state", "active");
  });

  it("renders children inside the shell", () => {
    renderShell("/profile");
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders heading and back link", () => {
    renderShell("/profile");
    expect(
      screen.getByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to jobs/i })).toHaveAttribute(
      "href",
      "/jobs",
    );
  });
});
