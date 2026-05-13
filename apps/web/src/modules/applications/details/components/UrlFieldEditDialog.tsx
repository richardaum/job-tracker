"use client";

import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import React, { useState } from "react";

interface UrlFieldEditDialogProps {
  control: DialogControl;
  value: string[];
  onSave: (nextValue: string[]) => Promise<void>;
}

export function UrlFieldEditDialog({
  control,
  value,
  onSave,
}: UrlFieldEditDialogProps) {
  const [draft, setDraft] = useState<string[]>(value.length > 0 ? value : [""]);
  const [saving, setSaving] = useState(false);
  const normalized = value.join("\n");
  const parsedUrls = draft.map((item) => item.trim()).filter(Boolean);
  const isValidUrl = parsedUrls.every((url) => /^https?:\/\/.+/.test(url));
  const hasDuplicates = new Set(parsedUrls).size !== parsedUrls.length;
  const hasErrors = !isValidUrl || hasDuplicates;
  const hasEmptyInput = draft.some((item) => item.trim().length === 0);

  async function handleSave() {
    const next = parsedUrls;
    if (hasErrors || next.join("\n") === normalized) return;
    setSaving(true);
    try {
      await onSave(next);
      control.close();
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    control.onOpenChange(nextOpen);
    if (nextOpen) {
      setDraft(value.length > 0 ? value : [""]);
    }
  }

  function handleChangeAt(index: number, nextValue: string) {
    setDraft((prev) => prev.map((item, i) => (i === index ? nextValue : item)));
  }

  function handleAddUrl() {
    setDraft((prev) => [...prev, ""]);
  }

  function handleRemoveAt(index: number) {
    setDraft((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  }

  return (
    <Dialog
      title="Edit job URLs"
      description="Update the source URLs for this application posting."
      open={control.isOpen}
      onOpenChange={handleOpenChange}
    >
      <Stack gap="sm">
        {draft.map((item, index) => {
          const trimmed = item.trim();
          const isRowValid =
            trimmed.length === 0 || /^https?:\/\/.+/.test(trimmed);
          return (
            <FormField
              key={`job-url-${index}`}
              label={index === 0 ? "Job URLs" : ""}
              htmlFor={`edit-job-url-${index}`}
              error={
                !isRowValid
                  ? "URL must start with http:// or https://"
                  : undefined
              }
            >
              <div className={cn("flex items-center gap-2")}>
                <Input
                  id={`edit-job-url-${index}`}
                  value={item}
                  onChange={(event) =>
                    handleChangeAt(index, event.target.value)
                  }
                  placeholder="https://example.com/jobs/123"
                  disabled={saving}
                  state={!isRowValid ? "error" : "default"}
                />
                <Button
                  intent="ghost"
                  onClick={() => handleRemoveAt(index)}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
            </FormField>
          );
        })}
        <div className={cn("flex items-center justify-between")}>
          <Button
            intent="secondary"
            onClick={handleAddUrl}
            disabled={saving || hasEmptyInput}
          >
            Add URL
          </Button>
          {hasDuplicates ? (
            <span className={cn("text-xs text-text-error")}>
              Duplicate URLs are not allowed.
            </span>
          ) : null}
        </div>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            disabled={hasErrors || parsedUrls.join("\n") === normalized}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
