"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog, Text } from "@job-tracker/ui";
import Link from "next/link";
import React, { useState } from "react";

import {
  ApplicationsDocument,
  useCreateApplicationWithAiV2Mutation,
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
  const [createApplicationWithAiV2] = useCreateApplicationWithAiV2Mutation();
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
      trigger={<span aria-hidden style={{ display: "none" }} />}
      title="Applications already linked"
      description={
        <div className={cn("space-y-2")}>
          <Text size="sm" color="secondary">
            Many applications may point to one draft (
            <span className={cn("text-text-primary")}>many-to-one</span>
            ). Each AI run adds another application linked here; we highlight
            the newest.
          </Text>
          <div>
            {previousApplicationId ? (
              <Link
                href={`/applications/${previousApplicationId}`}
                className={cn(
                  "text-sm text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset",
                )}
              >
                Latest linked application
              </Link>
            ) : (
              <Text size="sm" color="secondary">
                A linked application exists.
              </Text>
            )}
          </div>
          <Text size="sm" color="secondary">
            <span className={cn("text-text-primary")}>Duplicate</span> keeps any
            prior applications and queues another AI conversion.&nbsp;
            <span className={cn("text-text-primary")}>Replace all</span> removes
            every application linked to this draft, then converts again.
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
