"use client";

import { tryRun } from "@job-tracker/try-run";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { DraftJobsListDocument, useCreateDraftJobMutation } from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

import { PasteDestinationDialog } from "./components/PasteDestinationDialog";

export function PasteListenerProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pastedContent, setPastedContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { enqueueToast } = useToastQueue();

  const [createDraftJob, { loading: createDraftLoading }] =
    useCreateDraftJobMutation({
      refetchQueries: [{ query: DraftJobsListDocument }],
      awaitRefetchQueries: true,
    });

  const handlePasteCapture = useCallback((event: ClipboardEvent) => {
    const target = event.target;
    if (target instanceof Element) {
      // Skip paste events originating from input, textarea, or contenteditable elements
      if (target.closest("input, textarea, [contenteditable='true']")) {
        return;
      }
      // Skip paste when focus is inside a TipTap/ProseMirror editor
      // Covers cases where event.target is a wrapper but activeElement is the editor
      const active = document.activeElement;
      if (
        active instanceof Element &&
        (active.closest(".ProseMirror, [contenteditable='true']") ||
          active.classList.contains("ProseMirror"))
      ) {
        return;
      }
    }

    const plainText = event.clipboardData?.getData("text/plain").trim();
    const htmlText = event.clipboardData?.getData("text/html").trim();
    const normalized = plainText || htmlText;
    if (!normalized) {
      return;
    }

    event.preventDefault();
    setPastedContent(normalized);
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePasteCapture);
    return () => window.removeEventListener("paste", handlePasteCapture);
  }, [handlePasteCapture]);

  function titleFromUrl(url: string) {
    if (!url) return "Imported draft";
    const [err, parsed] = tryRun(() => new URL(url));
    if (!err) {
      return parsed.hostname;
    }
    return "Imported draft";
  }

  async function handleConfirmPasteImport(url: string, autoConvert: boolean) {
    const [createError, result] = await tryRun(
      createDraftJob({
        variables: {
          input: {
            url: url || null,
            title: titleFromUrl(url),
            htmlContent: pastedContent,
          },
        },
      }),
    );
    if (createError) {
      enqueueToast({
        title: "Could not create draft from pasted content.",
        intent: "error",
      });
      return;
    }

    const draftId = result?.data?.createDraftJob?.id;
    if (!draftId) return;

    setDialogOpen(false);
    setPastedContent("");

    const path = autoConvert
      ? `/draft-applications/${draftId}?autoConvert=true`
      : `/draft-applications/${draftId}`;

    router.push(path);
  }

  return (
    <>
      {children}
      <PasteDestinationDialog
        open={dialogOpen}
        pastedContent={pastedContent}
        submitting={createDraftLoading}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmPasteImport}
      />
    </>
  );
}
