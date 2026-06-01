"use client";

import { Button, cn, Combobox, type ComboboxOption, Dialog, FormField, Stack } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { useState } from "react";

import type { JobSource } from "@/gql/hooks";
import {
  JOB_SOURCE_COMBO_OPTIONS,
  jobSourceToComboLabel,
  parseJobSourceComboLabel,
} from "@/modules/jobs/shared/utils/jobSourceLabel";

const fieldId = "edit-job-source";

type SourceEditDialogProps = {
  control: DialogControl;
  value: JobSource | null | undefined;
  onSave: (nextValue: JobSource | null) => Promise<void>;
};

export function SourceEditDialog({ control, value, onSave }: SourceEditDialogProps) {
  const [draft, setDraft] = useState(() => jobSourceToComboLabel(value));
  const [saving, setSaving] = useState(false);
  const parsed = parseJobSourceComboLabel(draft);
  const isValid = parsed !== "invalid";
  const unchanged = isValid && (value ?? null) === parsed;
  const canSave = isValid && !unchanged && !saving;
  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const next = parseJobSourceComboLabel(draft);
      if (next === "invalid") return;
      await onSave(next);
      control.close();
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    control.onOpenChange(nextOpen);
    if (nextOpen) {
      setDraft(jobSourceToComboLabel(value));
    }
  }

  return (
    <Dialog
      title="Edit source"
      description="Choose where this job came from."
      open={control.isOpen}
      onOpenChange={handleOpenChange}
    >
      <Stack gap="sm">
        <FormField label="Source" htmlFor={fieldId}>
          <Combobox
            id={fieldId}
            value={draft}
            onInputValueChange={setDraft}
            onValueChange={(option) => setDraft(option.label)}
            options={JOB_SOURCE_COMBO_OPTIONS as ComboboxOption[]}
            placeholder="Search or pick a source"
            disabled={saving}
            state={!isValid && draft.trim() !== "" ? "error" : "default"}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            disabled={!canSave}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
