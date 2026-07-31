/**
 * Shared state store for AiBlockedDialog.
 * Allows opening the dialog from outside React components (e.g., from an Apollo error link).
 * Uses a simple EventTarget-based pub/sub pattern to notify React components of state changes.
 */

export type AiBlockedReason = "AI_DISABLED_BY_USER" | "AI_KEY_REQUIRED";

interface AiBlockedDialogState {
  open: boolean;
  reason?: AiBlockedReason;
}

class AiBlockedDialogStateStore extends EventTarget {
  private state: AiBlockedDialogState = { open: false };

  openDialog(reason: AiBlockedReason) {
    this.state = { open: true, reason };
    this.dispatchEvent(new CustomEvent("change", { detail: this.state }));
  }

  closeDialog() {
    this.state = { open: false };
    this.dispatchEvent(new CustomEvent("change", { detail: this.state }));
  }

  getState(): AiBlockedDialogState {
    return this.state;
  }

  subscribe(callback: (state: AiBlockedDialogState) => void): () => void {
    const listener = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(event.detail);
      }
    };
    this.addEventListener("change", listener);
    return () => this.removeEventListener("change", listener);
  }
}

export const aiBlockedDialogState = new AiBlockedDialogStateStore();
