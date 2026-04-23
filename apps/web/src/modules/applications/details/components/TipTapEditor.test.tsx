import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Button, cn } from "@job-tracker/ui";
import { TipTapEditor } from "./TipTapEditor";
import {
  EMPTY_TIPTAP_DOC,
  plainTextToTipTap,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

/**
 * Mirrors {@link NotesPanel} composer: controlled draft, same onChange guard,
 * and clearing the draft the same way as after a successful send.
 */
function NotesComposerLikeFixture({ initialDraft }: { initialDraft: string }) {
  const [draftNote, setDraftNote] = useState(initialDraft);
  const creatingNote = false;

  const canSend =
    tipTapToPlainText(draftNote).trim().length > 0 && !creatingNote;

  function handleSendNote() {
    if (!canSend) return;
    setDraftNote(EMPTY_TIPTAP_DOC);
  }

  return (
    <div>
      <div className={cn("mt-2 pt-2")}>
        <TipTapEditor
          id="application-note-composer-test"
          value={draftNote}
          onChange={(nextValue) => setDraftNote(nextValue || EMPTY_TIPTAP_DOC)}
          placeholder="Write a note..."
          disabled={creatingNote}
          contentClassName={cn(
            "min-h-0 [&_.ProseMirror]:min-h-5 [&_.ProseMirror]:max-h-40 [&_.ProseMirror]:overflow-y-auto",
          )}
        />
        <div className={cn("flex justify-end")}>
          <Button
            size="sm"
            intent="primary"
            type="button"
            onClick={() => {
              handleSendNote();
            }}
            disabled={!canSend}
            state="default"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

describe("TipTapEditor (integration)", () => {
  it("clears like NotesPanel after send: controlled draft and EMPTY_TIPTAP_DOC", async () => {
    const initialDraft = plainTextToTipTap(
      "Text that should disappear after clearing",
    );

    render(<NotesComposerLikeFixture initialDraft={initialDraft} />);

    await waitFor(() => {
      expect(
        screen.getByText("Text that should disappear after clearing"),
      ).toBeVisible();
    });

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Text that should disappear after clearing"),
      ).not.toBeInTheDocument();
    });

    const editor = screen.getByRole("textbox");
    expect(editor).toHaveTextContent("");
  });
});
