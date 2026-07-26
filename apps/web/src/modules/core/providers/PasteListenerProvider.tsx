"use client";

import { sanitizeCapturedHtml } from "@job-tracker/html-sanitize";
import { tryRun } from "@job-tracker/try-run";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import {
  ApplicationQuickFilter,
  JobsDocument,
  QuickFilterCountsDocument,
  useCreateDraftCaptureJobMutation,
} from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

import { PasteDestinationDialog } from "./components/PasteDestinationDialog";

type PasteListenerProviderProps = { children: ReactNode };
export function PasteListenerProvider({ children }: PasteListenerProviderProps) {
  const router = useRouter();
  const [pastedContent, setPastedContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { enqueueToast } = useToastQueue();

  const [createDraftCaptureJob, { loading: createDraftLoading }] = useCreateDraftCaptureJobMutation({
    refetchQueries: [
      { query: JobsDocument, variables: { filter: ApplicationQuickFilter.Draft } },
      { query: QuickFilterCountsDocument },
    ],
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
        (active.closest(".ProseMirror, [contenteditable='true']") || active.classList.contains("ProseMirror"))
      ) {
        return;
      }
    }

    const plainText = event.clipboardData?.getData("text/plain").trim();
    const htmlText = event.clipboardData?.getData("text/html").trim();
    const rawContent = htmlText || plainText;
    if (!rawContent) {
      return;
    }

    event.preventDefault();
    setPastedContent(sanitizeCapturedHtml(rawContent));
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

  async function handleConfirmPasteImport(url: string, afterCreate: { autoFill: boolean; autoMatch: boolean }) {
    const [createError, result] = await tryRun(
      createDraftCaptureJob({
        variables: {
          input: {
            title: titleFromUrl(url),
            urls: url ? [url] : [],
            htmlContent: pastedContent,
            createAsDraftCapture: true,
            autoFill: afterCreate.autoFill,
            autoMatch: afterCreate.autoMatch,
          },
        },
      }),
    );
    if (createError) {
      enqueueToast({ title: "Could not create draft from pasted content.", intent: "error" });
      return;
    }

    const draftId = result?.data?.createJob?.id;
    if (!draftId) return;

    setDialogOpen(false);
    setPastedContent("");

    router.push(`/jobs/${draftId}` as Route);
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
