"use client";

import {
  Button,
  cn,
  Dialog,
  type DialogControl,
  FormField,
  Input,
  Stack,
} from "@job-tracker/ui";
import React, { useState } from "react";

interface ResumeTitleEditDialogProps {
  control: DialogControl;
  value: string;
  onSave: (nextValue: string) => Promise<void>;
}

export function ResumeTitleEditDialog({
  control,
  value,
  onSave,
}: ResumeTitleEditDialogProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const next = draft.trim();
    if (!next || next === value) return;
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
      setDraft(value);
    }
  }

  return (
    <Dialog
      title="Update resume title"
      description="This title appears on your resume card and wherever you choose a resume."
      open={control.isOpen}
      onOpenChange={handleOpenChange}
    >
      <Stack gap="sm">
        <FormField label="Resume title" htmlFor="resume-title-edit-input">
          <Input
            id="resume-title-edit-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. Software engineer — condensed"
            disabled={saving}
            autoFocus
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
