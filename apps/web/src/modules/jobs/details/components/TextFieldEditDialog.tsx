"use client";

import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { SparkleIcon } from "@phosphor-icons/react";
import { useState } from "react";

interface TextFieldEditDialogProps {
  control: DialogControl;
  label: string;
  value: string;
  placeholder: string;
  onSave: (nextValue: string) => Promise<void>;
  onAiFill?: () => Promise<string | null>;
}

export function TextFieldEditDialog({
  control,
  label,
  value,
  placeholder,
  onSave,
  onAiFill,
}: TextFieldEditDialogProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  async function handleSave() {
    const next = draft.trim();
    if (next === value) return;
    setSaving(true);
    try {
      await onSave(next);
      control.close();
    } finally {
      setSaving(false);
    }
  }

  async function handleAiFill() {
    if (!onAiFill) return;
    setAiLoading(true);
    try {
      const result = await onAiFill();
      if (result) setDraft(result);
    } finally {
      setAiLoading(false);
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
      title={`Edit ${label.toLowerCase()}`}
      description={`Update the ${label.toLowerCase()} value for this job.`}
      open={control.isOpen}
      onOpenChange={handleOpenChange}
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
        <div className={cn("flex items-center justify-between")}>
          {onAiFill ? (
            <Button
              intent="ghost"
              size="sm"
              leftIcon={<SparkleIcon size={14} weight="regular" />}
              state={aiLoading ? "loading" : "default"}
              onClick={() => void handleAiFill()}
            >
              Fill with AI
            </Button>
          ) : null}
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            disabled={draft.trim() === value}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
