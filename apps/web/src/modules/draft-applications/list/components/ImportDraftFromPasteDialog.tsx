"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog, Input, Text } from "@job-tracker/ui";
import React, { useMemo, useState } from "react";

interface ImportDraftFromPasteDialogProps {
  open: boolean;
  pastedContent: string;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => Promise<void>;
}

function truncatePreview(content: string, maxLength = 300) {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
}

export function ImportDraftFromPasteDialog({
  open,
  pastedContent,
  submitting = false,
  onOpenChange,
  onConfirm,
}: ImportDraftFromPasteDialogProps) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const preview = useMemo(
    () => truncatePreview(pastedContent),
    [pastedContent],
  );

  async function handleConfirm() {
    const normalized = url.trim();
    if (!normalized) {
      setUrlError("URL is required.");
      return;
    }

    const [urlErr] = tryRun(() => {
      void new URL(normalized);
    });
    if (urlErr) {
      setUrlError("Enter a valid URL including protocol (https://...).");
      return;
    }

    setUrlError(null);
    await onConfirm(normalized);
    setUrl("");
  }

  return (
    <Dialog
      trigger={<span aria-hidden style={{ display: "none" }} />}
      title="Import pasted content"
      description="Provide the source URL and confirm to create a new draft."
      size="xl"
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setUrl("");
          setUrlError(null);
        }
      }}
      footer={
        <div className={cn("flex items-center justify-end gap-2")}>
          <Button
            intent="secondary"
            type="button"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            state={submitting ? "loading" : "default"}
            onClick={handleConfirm}
          >
            Create draft
          </Button>
        </div>
      }
    >
      <div className={cn("space-y-4")}>
        <label className={cn("block space-y-1.5")}>
          <Text size="sm" weight="medium">
            URL
          </Text>
          <Input
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="https://example.com/job-posting"
            state={urlError ? "error" : "default"}
            autoFocus
          />
          {urlError ? (
            <Text size="xs" color="error">
              {urlError}
            </Text>
          ) : null}
        </label>

        <div className={cn("space-y-1.5")}>
          <Text size="sm" weight="medium">
            Pasted content (preview)
          </Text>
          <div
            className={cn(
              "max-h-56 overflow-auto rounded-md border border-border-subtle bg-bg-surface-hover p-3 font-mono text-xs text-text-secondary",
              "whitespace-pre-wrap wrap-break-word",
            )}
          >
            {preview}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
