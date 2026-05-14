"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog, Text } from "@job-tracker/ui";
import Link from "next/link";
import React, { useState } from "react";

import {
  ApplicationsDocument,
  useCreateApplicationWithAIMutation,
  useDeleteApplicationsForDraftMutation,
} from "@/gql/hooks";

interface ConvertDraftConflictDialogProps {
  open: boolean;
  draftId?: string;
  previousApplicationId: string | null;
  onOpenChange: (open: boolean) => void;
  onDeletePreviousSuccess?: () => void;
  onConversionSuccess?: () => void;
  onError?: (message: string) => void;
}

export function ConvertDraftConflictDialog({
  open,
  draftId,
  previousApplicationId,
  onOpenChange,
  onDeletePreviousSuccess,
  onConversionSuccess,
  onError,
}: ConvertDraftConflictDialogProps) {
  const [action, setAction] = useState<
    "replace-all" | "create-duplicate" | null
  >(null);
  const [createApplicationWithAI] = useCreateApplicationWithAIMutation();
  const [deleteApplicationsForDraft] = useDeleteApplicationsForDraftMutation({
    refetchQueries: [{ query: ApplicationsDocument }],
    awaitRefetchQueries: true,
  });
  const isSubmitting = action !== null;

  async function createFromDraft() {
    if (!draftId) {
      onError?.("Missing draft id for conversion.");
      return false;
    }

    const [createError] = await tryRun(
      createApplicationWithAI({ variables: { draftId } }),
    );

    if (createError) {
      onError?.(createError.message || "Failed to start draft conversion.");
      return false;
    }

    onConversionSuccess?.();
    onOpenChange(false);
    return true;
  }

  async function handleDuplicate() {
    setAction("create-duplicate");
    await createFromDraft();
    setAction(null);
  }

  async function handleReplaceAll() {
    setAction("replace-all");

    if (!draftId) {
      onError?.("Missing draft id for conversion.");
      setAction(null);
      return;
    }

    const [purgeError] = await tryRun(
      deleteApplicationsForDraft({ variables: { draftId } }),
    );

    if (purgeError) {
      onError?.(
        purgeError.message || "Failed to delete applications for this draft.",
      );
      setAction(null);
      return;
    }

    onDeletePreviousSuccess?.();

    await createFromDraft();
    setAction(null);
  }

  return (
    <Dialog
      title="This draft was already converted"
      description={
        <div className={cn("space-y-3")}>
          <Text size="sm" color="secondary">
            Every time you run AI on this draft, we add another job entry and
            show which one is newest.
            {previousApplicationId ? (
              <>
                {" "}
                <Link
                  href={`/applications/${previousApplicationId}`}
                  className={cn(
                    "font-medium text-text-brand underline underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset",
                  )}
                >
                  Open that job
                </Link>{" "}
                to review it.
              </>
            ) : (
              <> One is already saved from earlier.</>
            )}
          </Text>
          <Text size="sm" color="secondary">
            <span className={cn("text-text-primary")}>Duplicate</span> keeps
            what you already have and runs AI again for a new entry.&nbsp;
            <span className={cn("text-text-primary")}>Replace all</span> clears
            every job we created from this draft, then runs AI again from
            scratch.
          </Text>
        </div>
      }
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <div
          className={cn("flex w-full flex-nowrap items-center justify-between")}
        >
          <Button
            intent="ghost"
            className={cn("text-text-primary hover:bg-bg-surface-hover")}
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <div className={cn("flex items-center gap-2")}>
            <Button
              intent="secondary"
              state={action === "create-duplicate" ? "loading" : "default"}
              disabled={isSubmitting}
              onClick={() => void handleDuplicate()}
            >
              Duplicate
            </Button>
            <Button
              intent="destructive"
              state={action === "replace-all" ? "loading" : "default"}
              disabled={isSubmitting}
              onClick={() => void handleReplaceAll()}
            >
              Replace all
            </Button>
          </div>
        </div>
      }
    />
  );
}
