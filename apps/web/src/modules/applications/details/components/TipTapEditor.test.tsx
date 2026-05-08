import { Button, cn } from "@job-tracker/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  EMPTY_TIPTAP_DOC,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

import { TipTapEditor, type TipTapEditorHandle } from "./TipTapEditor";

/**
 * Mirrors {@link NotesPanel} composer: controlled draft, same onChange guard,
 * and clearing via `composerRef.current.clear()` like {@link NotesPanel} after send.
 */
function NotesComposerLikeFixture({
  composerRef,
}: {
  composerRef: React.RefObject<TipTapEditorHandle | null>;
}) {
  const [draftNote, setDraftNote] = useState(EMPTY_TIPTAP_DOC);
  const creatingNote = false;

  const canSend =
    tipTapToPlainText(draftNote).trim().length > 0 && !creatingNote;

  function handleSendNote() {
    if (!canSend) return;
    composerRef.current?.clear();
  }

  return (
    <div>
      <div className={cn("mt-2 pt-2")}>
        <TipTapEditor
          ref={composerRef}
          id="application-note-composer-test"
          value={draftNote}
          onChange={(nextValue) => setDraftNote(nextValue || EMPTY_TIPTAP_DOC)}
          onHardEnter={canSend ? handleSendNote : undefined}
          placeholder="Write a note..."
          disabled={creatingNote}
          contentClassName={cn(
            "min-h-0 [&_.ProseMirror]:min-h-5 [&_.ProseMirror]:max-h-40 [&_.ProseMirror]:overflow-y-auto",
          )}
        />
        <div className={cn("flex justify-end")}>
          <Button
            size="md"
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
  it("clears like NotesPanel after send: type a message, then ref.clear()", async () => {
    const user = userEvent.setup();
    const message = "Text that should disappear after clearing";
    const composerRef = createRef<TipTapEditorHandle>();

    render(<NotesComposerLikeFixture composerRef={composerRef} />);

    // Layout DOM stubs live in `vitest.setup.ts` (see tiptap#4008). `TipTapEditor` skips
    // controlled `setContent` while the doc is ahead of React `value` so typing stays stable.
    const editor = await screen.findByRole("textbox");
    await user.click(editor);
    await user.type(editor, message);

    await waitFor(() => {
      expect(screen.getByText(message)).toBeVisible();
      expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    expect(screen.getByRole("textbox")).toHaveTextContent("");
  });

  it("triggers onHardEnter and clears editor on Ctrl+Enter when canSend is true", async () => {
    const user = userEvent.setup();
    const message = "Send with keyboard";
    const composerRef = createRef<TipTapEditorHandle>();

    render(<NotesComposerLikeFixture composerRef={composerRef} />);

    const editor = await screen.findByRole("textbox");
    await user.click(editor);
    await user.type(editor, message);

    await waitFor(() => {
      expect(screen.getByText(message)).toBeVisible();
    });

    await user.keyboard("{Control>}{Enter}{/Control}");

    await waitFor(() => {
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    expect(screen.getByRole("textbox")).toHaveTextContent("");
  });

  it("calls onHardEnter callback on Ctrl+Enter", async () => {
    const user = userEvent.setup();
    const onHardEnter = vi.fn();

    render(
      <TipTapEditor
        value=""
        onChange={() => {}}
        onHardEnter={onHardEnter}
        placeholder="Write a note..."
      />,
    );

    const editor = await screen.findByRole("textbox");
    await user.click(editor);
    await user.keyboard("{Control>}{Enter}{/Control}");

    expect(onHardEnter).toHaveBeenCalledOnce();
  });
});
