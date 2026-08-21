import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuickTips } from "./QuickTips";

const { updateSettingsMock } = vi.hoisted(() => ({ updateSettingsMock: vi.fn() }));

vi.mock("@/gql/hooks", () => ({ useUpdateSettingsMutation: () => [updateSettingsMock] }));

describe("QuickTips", () => {
  beforeEach(() => {
    updateSettingsMock.mockResolvedValue({});
    updateSettingsMock.mockClear();
  });

  it("shows the paste-to-draft tip", () => {
    render(<QuickTips lastShownTipId={null} dismissedTipIds={[]} />);

    expect(screen.getByText("Quick tips")).toBeInTheDocument();
    expect(screen.getByText("Paste job description content to create a draft quickly.")).toBeInTheDocument();
  });

  it("opens the complete tip in a dialog", async () => {
    const user = userEvent.setup();
    render(<QuickTips lastShownTipId={null} dismissedTipIds={[]} />);

    await user.click(screen.getByRole("button", { name: "View quick tip" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("The shortcut")).toBeInTheDocument();
    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Copy the job description content.")).toBeInTheDocument();
    expect(screen.getByText("Paste it with ⌘V on Mac or Ctrl+V on Windows.")).toBeInTheDocument();
  });

  it("opens AI Settings from the AI settings tip", async () => {
    const user = userEvent.setup();
    render(<QuickTips lastShownTipId="paste-to-draft:v1" dismissedTipIds={[]} />);

    expect(screen.getByText("Want more control over the AI features you use? Go to AI Settings.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View quick tip" }));

    expect(screen.getByText("Tune your AI setup to match how you want to work.")).toBeInTheDocument();
    const aiSettingsLink = screen.getByRole("link", { name: "Go to AI settings" });
    expect(aiSettingsLink).toHaveAttribute("href", "/profile/ai/settings");

    await user.click(aiSettingsLink);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog from its primary acknowledgement", async () => {
    const user = userEvent.setup();
    render(<QuickTips lastShownTipId={null} dismissedTipIds={[]} />);

    await user.click(screen.getByRole("button", { name: "View quick tip" }));
    await user.click(screen.getByRole("button", { name: "I’ll try it" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("records the displayed tip", () => {
    render(<QuickTips lastShownTipId={null} dismissedTipIds={[]} />);

    expect(updateSettingsMock).toHaveBeenCalledWith({ variables: { input: { lastQuickTipId: "paste-to-draft:v1" } } });
  });

  it("keeps the selected tip visible when the settings cache updates", () => {
    const { rerender } = render(<QuickTips lastShownTipId={null} dismissedTipIds={[]} />);

    rerender(<QuickTips lastShownTipId="paste-to-draft:v1" dismissedTipIds={[]} />);

    expect(screen.getByText("Paste job description content to create a draft quickly.")).toBeInTheDocument();
    expect(
      screen.queryByText("Want more control over the AI features you use? Go to AI Settings."),
    ).not.toBeInTheDocument();
  });

  it("persists and hides the current quick tip when dismissed", async () => {
    const user = userEvent.setup();
    render(<QuickTips lastShownTipId={null} dismissedTipIds={[]} />);

    await user.click(screen.getByRole("button", { name: "Dismiss quick tip" }));

    expect(updateSettingsMock).toHaveBeenCalledWith({
      variables: { input: { dismissedQuickTipIds: ["paste-to-draft:v1"] } },
    });
    expect(screen.queryByText("Quick tips")).not.toBeInTheDocument();
  });

  it("does not render when every tip has been dismissed", () => {
    render(<QuickTips lastShownTipId={null} dismissedTipIds={["paste-to-draft:v1", "ai-settings:v1"]} />);

    expect(screen.queryByText("Quick tips")).not.toBeInTheDocument();
  });
});
