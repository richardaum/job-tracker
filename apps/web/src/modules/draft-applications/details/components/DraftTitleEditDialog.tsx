"use client";

import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import React, { useState } from "react";

import { FieldEditTriggerButton } from "@/modules/applications/details/components/FieldEditTriggerButton";

interface DraftTitleEditDialogProps {
  value: string;
  onSave: (nextValue: string) => Promise<void>;
}

export function DraftTitleEditDialog({
  value,
  onSave,
}: DraftTitleEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const next = draft.trim();
    if (!next || next === value) return;
    setSaving(true);
    try {
      await onSave(next);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(value);
    }
  }

  return (
    <Dialog
      title="Edit page title"
      description="Update the page title for this draft."
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit page title" />}
    >
      <Stack gap="sm">
        <FormField label="Page title" htmlFor="edit-draft-page-title">
          <Input
            id="edit-draft-page-title"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            disabled={saving}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            disabled={!draft.trim() || draft.trim() === value}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
