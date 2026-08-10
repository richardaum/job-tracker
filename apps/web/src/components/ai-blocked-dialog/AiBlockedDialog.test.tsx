import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiBlockedDialog } from "./AiBlockedDialog";
import { aiBlockedDialogState } from "@/lib/ai-blocked-dialog-state";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

describe("AiBlockedDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with AI_DISABLED_BY_USER message", async () => {
    render(<AiBlockedDialog />);

    act(() => aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER"));

    await waitFor(() => {
      expect(screen.getByText("AI Features Unavailable")).toBeInTheDocument();
      expect(
        screen.getByText("AI is turned off for your account. You can turn it back on in your settings."),
      ).toBeInTheDocument();
    });
  });

  it("should render with AI_KEY_REQUIRED message", async () => {
    render(<AiBlockedDialog />);

    act(() => aiBlockedDialogState.openDialog("AI_KEY_REQUIRED"));

    await waitFor(() => {
      expect(screen.getByText("AI Features Unavailable")).toBeInTheDocument();
      expect(
        screen.getByText("Your AI trial is over — add your own OpenAI key to keep using AI features."),
      ).toBeInTheDocument();
    });
  });

  it("should have Settings link", async () => {
    render(<AiBlockedDialog />);

    act(() => aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER"));

    await waitFor(() => {
      const link = screen.getByRole("link", { name: /Go to Settings/i });
      expect(link).toHaveAttribute("href", "/profile/settings");
    });
  });

  it("should close dialog when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    render(<AiBlockedDialog />);

    act(() => aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER"));

    await waitFor(() => {
      expect(screen.getByText("AI Features Unavailable")).toBeInTheDocument();
    });

    const dismissButton = screen.getByRole("button", { name: /Dismiss/i });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText("AI Features Unavailable")).not.toBeInTheDocument();
    });
  });

  it("should close dialog when Go to Settings is clicked", async () => {
    const user = userEvent.setup();
    render(<AiBlockedDialog />);

    act(() => aiBlockedDialogState.openDialog("AI_KEY_REQUIRED"));

    await waitFor(() => {
      expect(screen.getByText("AI Features Unavailable")).toBeInTheDocument();
    });

    const settingsButton = screen.getByRole("button", { name: /Go to Settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      expect(aiBlockedDialogState.getState().open).toBe(false);
    });
  });

  it("should respond to state changes", async () => {
    render(<AiBlockedDialog />);

    // Initially not open
    expect(screen.queryByText("AI Features Unavailable")).not.toBeInTheDocument();

    // Open with AI_DISABLED_BY_USER
    act(() => aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER"));

    await waitFor(() => {
      expect(
        screen.getByText("AI is turned off for your account. You can turn it back on in your settings."),
      ).toBeInTheDocument();
    });

    // Close
    act(() => aiBlockedDialogState.closeDialog());

    await waitFor(() => {
      expect(screen.queryByText("AI Features Unavailable")).not.toBeInTheDocument();
    });

    // Open with AI_KEY_REQUIRED
    act(() => aiBlockedDialogState.openDialog("AI_KEY_REQUIRED"));

    await waitFor(() => {
      expect(
        screen.getByText("Your AI trial is over — add your own OpenAI key to keep using AI features."),
      ).toBeInTheDocument();
    });
  });
});
