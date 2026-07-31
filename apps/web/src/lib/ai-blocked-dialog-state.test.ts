import { describe, it, expect, beforeEach, vi } from "vitest";
import { aiBlockedDialogState } from "./ai-blocked-dialog-state";

describe("aiBlockedDialogState", () => {
  beforeEach(() => {
    // Reset state before each test by closing the dialog
    aiBlockedDialogState.closeDialog();
  });

  it("should initialize with closed state", () => {
    const state = aiBlockedDialogState.getState();
    expect(state.open).toBe(false);
    expect(state.reason).toBeUndefined();
  });

  it("should open dialog with AI_DISABLED_BY_USER reason", () => {
    const callback = vi.fn();
    aiBlockedDialogState.subscribe(callback);

    aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER");

    expect(callback).toHaveBeenCalledWith({ open: true, reason: "AI_DISABLED_BY_USER" });

    const state = aiBlockedDialogState.getState();
    expect(state.open).toBe(true);
    expect(state.reason).toBe("AI_DISABLED_BY_USER");
  });

  it("should open dialog with AI_KEY_REQUIRED reason", () => {
    const callback = vi.fn();
    aiBlockedDialogState.subscribe(callback);

    aiBlockedDialogState.openDialog("AI_KEY_REQUIRED");

    expect(callback).toHaveBeenCalledWith({ open: true, reason: "AI_KEY_REQUIRED" });

    const state = aiBlockedDialogState.getState();
    expect(state.open).toBe(true);
    expect(state.reason).toBe("AI_KEY_REQUIRED");
  });

  it("should close dialog", () => {
    const callback = vi.fn();
    aiBlockedDialogState.subscribe(callback);

    aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER");
    callback.mockClear();

    aiBlockedDialogState.closeDialog();

    expect(callback).toHaveBeenCalledWith({ open: false });

    const state = aiBlockedDialogState.getState();
    expect(state.open).toBe(false);
    expect(state.reason).toBeUndefined();
  });

  it("should support multiple subscribers", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    aiBlockedDialogState.subscribe(callback1);
    aiBlockedDialogState.subscribe(callback2);

    aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER");

    expect(callback1).toHaveBeenCalledWith({ open: true, reason: "AI_DISABLED_BY_USER" });
    expect(callback2).toHaveBeenCalledWith({ open: true, reason: "AI_DISABLED_BY_USER" });
  });

  it("should unsubscribe correctly", () => {
    const callback = vi.fn();
    const unsubscribe = aiBlockedDialogState.subscribe(callback);

    aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER");
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    aiBlockedDialogState.closeDialog();
    expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it("should allow re-opening dialog with different reason", () => {
    const callback = vi.fn();
    aiBlockedDialogState.subscribe(callback);

    aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER");
    expect(callback).toHaveBeenLastCalledWith({ open: true, reason: "AI_DISABLED_BY_USER" });

    aiBlockedDialogState.openDialog("AI_KEY_REQUIRED");
    expect(callback).toHaveBeenLastCalledWith({ open: true, reason: "AI_KEY_REQUIRED" });
  });
});
