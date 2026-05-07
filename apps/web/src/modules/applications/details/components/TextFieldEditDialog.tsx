"use client";

import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import React, { useState } from "react";

import { FieldEditTriggerButton } from "./FieldEditTriggerButton";

interface TextFieldEditDialogProps {
  label: string;
  value: string;
  placeholder: string;
  onSave: (nextValue: string) => Promise<void>;
}

export function TextFieldEditDialog({
  label,
  value,
  placeholder,
  onSave,
}: TextFieldEditDialogProps) {
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
      title={`Edit ${label.toLowerCase()}`}
      description={`Update the ${label.toLowerCase()} value for this application.`}
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label={`Edit ${label}`} />}
    >
      <Stack gap="sm">
        <FormField
          label={label}
          htmlFor={`edit-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <Input
            id={`edit-${label.toLowerCase().replace(/\s+/g, "-")}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            disabled={saving}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
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
