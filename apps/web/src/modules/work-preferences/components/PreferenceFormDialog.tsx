"use client";

import {
  Button,
  cn,
  Dialog,
  FieldWithLabelAction,
  Input,
} from "@job-tracker/ui";
import { useState } from "react";

import { Weight } from "@/gql/hooks";
import { PreferenceWeightDropdown } from "@/modules/work-preferences/components/PreferenceWeightDropdown";

interface PreferenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialText?: string;
  initialWeight?: Weight;
  onSubmit: (values: { text: string; weight: Weight }) => Promise<void>;
}

export function PreferenceFormDialog({
  open,
  onOpenChange,
  mode,
  initialText = "",
  initialWeight = Weight.Low,
  onSubmit,
}: PreferenceFormDialogProps) {
  const [text, setText] = useState(initialText);
  const [weight, setWeight] = useState(initialWeight);
  const [saving, setSaving] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setText(initialText);
      setWeight(initialWeight);
      setSaving(false);
    }
  }

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ text: trimmed, weight });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add preference" : "Edit preference"}
      description="Describe what matters to you in a job and set how strongly it should influence match analysis."
      footer={
        <div className={cn("flex justify-end gap-2")}>
          <Button intent="ghost" size="md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            intent="primary"
            size="md"
            onClick={() => void handleSubmit()}
            disabled={!text.trim() || saving}
            state={saving ? "loading" : "default"}
          >
            {mode === "create" ? "Add" : "Save"}
          </Button>
        </div>
      }
    >
      <div className={cn("flex flex-col gap-4 py-2")}>
        <FieldWithLabelAction
          label="Preference"
          content={
            <Input
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, 255))}
              maxLength={255}
              placeholder="e.g. Remote-first company"
            />
          }
        />
        <FieldWithLabelAction
          label="Weight"
          content={
            <PreferenceWeightDropdown
              value={weight}
              onChange={setWeight}
              variant="labeled"
              fullWidth
            />
          }
        />
      </div>
    </Dialog>
  );
}
