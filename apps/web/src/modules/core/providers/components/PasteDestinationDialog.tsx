"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, Checkbox, cn, Dialog, Input, Text } from "@job-tracker/ui";
import { SparkleIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { useSettingsQuery } from "@/gql/hooks";

interface PasteDestinationDialogProps {
  open: boolean;
  pastedContent: string;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string, autoFill: boolean) => Promise<void>;
}

type PasteAction = "draft";

const PASTE_ACTIONS: { id: PasteAction; label: string; description: string }[] =
  [
    {
      id: "draft",
      label: "Save as draft",
      description: "Create a new draft job from the pasted content",
    },
  ];

function truncatePreview(content: string, maxLength = 300) {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
}

export function PasteDestinationDialog({
  open,
  pastedContent,
  submitting = false,
  onOpenChange,
  onConfirm,
}: PasteDestinationDialogProps) {
  const { data: settingsData } = useSettingsQuery({
    fetchPolicy: "cache-first",
  });
  const [selectedAction, setSelectedAction] = useState<PasteAction>("draft");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [autoFillOverride, setAutoFillOverride] = useState<boolean | null>(
    null,
  );
  const preview = useMemo(
    () => truncatePreview(pastedContent),
    [pastedContent],
  );

  const defaultAutoFill = settingsData?.settings.autoFillEnabled ?? false;
  const autoFill = autoFillOverride ?? defaultAutoFill;

  async function handleConfirm() {
    const normalized = url.trim();

    if (normalized) {
      const [urlErr] = tryRun(() => {
        void new URL(normalized);
      });
      if (urlErr) {
        setUrlError("Enter a valid URL including protocol (https://...).");
        return;
      }
    }

    setUrlError(null);
    await onConfirm(normalized, autoFill);
    setUrl("");
  }

  return (
    <Dialog
      title="Paste detected"
      description="What do you want to do with the pasted content?"
      size="xl"
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setUrl("");
          setUrlError(null);
          setAutoFillOverride(null);
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
            disabled={submitting}
            state={submitting ? "loading" : "default"}
            onClick={handleConfirm}
          >
            {selectedAction === "draft" ? "Create draft" : "Confirm"}
          </Button>
        </div>
      }
    >
      <div className={cn("space-y-4")}>
        <div className={cn("space-y-2")}>
          <Text size="sm" weight="medium">
            Action
          </Text>
          <div className={cn("space-y-2")}>
            {PASTE_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
                  selectedAction === action.id
                    ? "border-border-brand bg-bg-brand-subtle"
                    : "border-border-default hover:bg-bg-surface-hover",
                )}
                onClick={() => setSelectedAction(action.id)}
              >
                <div
                  className={cn(
                    "mt-0.5 size-4 shrink-0 rounded-full border-2",
                    selectedAction === action.id
                      ? "border-border-brand bg-bg-brand"
                      : "border-border-default",
                  )}
                />
                <div>
                  <Text size="sm" weight="medium">
                    {action.label}
                  </Text>
                  <Text size="xs" color="muted">
                    {action.description}
                  </Text>
                </div>
              </button>
            ))}
          </div>
        </div>

        <label className={cn("block space-y-1.5")}>
          <Text size="sm" weight="medium">
            URL <span className={cn("text-text-muted")}>(optional)</span>
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

        <label className={cn("flex items-center gap-2")}>
          <Checkbox
            checked={autoFill}
            onCheckedChange={(checked) => {
              setAutoFillOverride(checked);
            }}
            size="sm"
          />
          <SparkleIcon size={14} weight="regular" aria-hidden />
          <Text size="sm">Fill job fields automatically</Text>
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
