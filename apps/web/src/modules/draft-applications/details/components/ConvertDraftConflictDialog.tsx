"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog } from "@job-tracker/ui";
import Link from "next/link";
import React, { useState } from "react";

import {
  ApplicationsDocument,
  useCreateApplicationWithAiV2Mutation,
  useDeleteApplicationMutation,
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
    "delete-previous" | "create-duplicate" | null
  >(null);
  const [createApplicationWithAiV2] = useCreateApplicationWithAiV2Mutation();
  const [deleteApplication] = useDeleteApplicationMutation({
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
      createApplicationWithAiV2({ variables: { draftId } }),
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

  async function handleReplace() {
    setAction("delete-previous");

    if (previousApplicationId) {
      const [deleteError] = await tryRun(
        deleteApplication({ variables: { id: previousApplicationId } }),
      );

      if (deleteError) {
        onError?.(
          deleteError.message || "Failed to delete previous application.",
        );
        setAction(null);
        return;
      }

      onDeletePreviousSuccess?.();
    }

    await createFromDraft();
    setAction(null);
  }

  return (
    <Dialog
      trigger={<span aria-hidden style={{ display: "none" }} />}
      title="Application already exists"
      description={
        <>
          This draft already has{" "}
          {previousApplicationId ? (
            <Link
              href={`/applications/${previousApplicationId}`}
              className={cn(
                "text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset",
              )}
            >
              a created application
            </Link>
          ) : (
            "a created application"
          )}
          . Choose whether to delete the previous one or create a duplicate.
        </>
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
              state={action === "delete-previous" ? "loading" : "default"}
              disabled={isSubmitting}
              onClick={() => void handleReplace()}
            >
              Replace
            </Button>
          </div>
        </div>
      }
    />
  );
}
