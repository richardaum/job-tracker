"use client";

import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import React, { useState } from "react";

import { FieldEditTriggerButton } from "./HoverEditableFieldRow";

interface UrlFieldEditDialogProps {
  value?: string | null;
  onSave: (nextValue: string | null) => Promise<void>;
}

export function UrlFieldEditDialog({ value, onSave }: UrlFieldEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const normalized = value ?? "";
  const isValidUrl =
    draft.trim().length === 0 || /^https?:\/\/.+/.test(draft.trim());

  async function handleSave() {
    const next = draft.trim();
    const nextValue = next.length === 0 ? null : next;
    if (!isValidUrl || next === normalized) return;
    setSaving(true);
    try {
      await onSave(nextValue);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(value ?? "");
    }
  }

  return (
    <Dialog
      title="Edit job URL"
      description="Update the source URL for this application posting."
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit job URL" />}
    >
      <Stack gap="sm">
        <FormField
          label="Job URL"
          htmlFor="edit-job-url"
          error={
            !isValidUrl ? "URL must start with http:// or https://" : undefined
          }
        >
          <Input
            id="edit-job-url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://example.com/jobs/123"
            disabled={saving}
            state={!isValidUrl ? "error" : "default"}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={!isValidUrl || draft.trim() === normalized}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
