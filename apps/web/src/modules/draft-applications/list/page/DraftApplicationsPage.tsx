"use client";

import { captureSync, to } from "@job-tracker/async";
import { Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import {
  DraftApplicationsListDocument,
  useCreateDraftApplicationMutation,
} from "@/gql/hooks";
import { SearchInput } from "@/modules/applications/shared/components/SearchInput";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { DraftApplicationCard } from "@/modules/draft-applications/list/components/DraftApplicationCard";
import { ImportDraftFromPasteDialog } from "@/modules/draft-applications/list/components/ImportDraftFromPasteDialog";
import { useDraftApplicationsListViewModel } from "@/modules/draft-applications/list/hooks/useDraftApplicationsListViewModel";

function DraftListCardSkeleton() {
  return (
    <Card padding="sm">
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            <Skeleton
              variant="text"
              className={cn("h-5 w-[min(12rem,100%)] max-w-full")}
            />
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <Skeleton variant="text" className={cn("h-4 w-44 max-w-full")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function DraftApplicationsListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <DraftListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function DraftApplicationsListError() {
  return (
    <Text size="sm" color="error">
      Failed to load drafts. Please refresh the page.
    </Text>
  );
}

export default function DraftApplicationsPage() {
  const { drafts, error, showInitialLoading } =
    useDraftApplicationsListViewModel();
  const { enqueueToast } = useToastQueue();
  const [pastedContent, setPastedContent] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [createDraftApplication, { loading: createDraftLoading }] =
    useCreateDraftApplicationMutation({
      refetchQueries: [{ query: DraftApplicationsListDocument }],
      awaitRefetchQueries: true,
    });

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  function titleFromUrl(url: string) {
    const [err, parsed] = captureSync(() => new URL(url));
    if (!err) {
      return parsed.hostname;
    }
    return "Imported draft";
  }

  const handlePasteCapture = useCallback((event: ClipboardEvent) => {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("input, textarea, [contenteditable='true']")
    ) {
      return;
    }

    const plainText = event.clipboardData?.getData("text/plain").trim();
    const htmlText = event.clipboardData?.getData("text/html").trim();
    const normalized = plainText || htmlText;
    if (!normalized) {
      return;
    }

    event.preventDefault();
    setPastedContent(normalized);
    setImportDialogOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePasteCapture);
    return () => window.removeEventListener("paste", handlePasteCapture);
  }, [handlePasteCapture]);

  async function handleConfirmPasteImport(url: string) {
    const [error] = await to(
      createDraftApplication({
        variables: {
          input: { url, title: titleFromUrl(url), htmlContent: pastedContent },
        },
      }),
    );
    if (error) {
      showToast("Could not create draft from pasted content.", "error");
      return;
    }
    setImportDialogOpen(false);
    setPastedContent("");
    showToast("Draft imported from pasted content.", "success");
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4  sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <SearchInput placeholder="Search drafts..." shortcutHint="⌘/" />

        <div className={cn("w-full sm:w-auto")} />
      </div>

      {/* Secondary row — mirrors QuickFilters strip height */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
        )}
      >
        <Text size="sm" color="muted">
          Saved imports from the browser extension and pasted content appear
          here.
        </Text>
      </div>

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <DraftApplicationsListSkeleton />
        ) : error ? (
          <DraftApplicationsListError />
        ) : drafts.length === 0 ? (
          <EmptyState
            variant="default"
            message="No draft applications yet."
            detail="Import a job page from the extension to create one."
          />
        ) : (
          <Stack gap="sm">
            {drafts.map((draft) => (
              <DraftApplicationCard
                key={draft.id}
                draft={draft}
                onSuccess={(msg) => showToast(msg, "success")}
                onError={(msg) => showToast(msg, "error")}
              />
            ))}
          </Stack>
        )}
      </div>
      <ImportDraftFromPasteDialog
        open={importDialogOpen}
        pastedContent={pastedContent}
        submitting={createDraftLoading}
        onOpenChange={setImportDialogOpen}
        onConfirm={handleConfirmPasteImport}
      />
    </div>
  );
}
