"use client";

import {
  Button,
  cn,
  Combobox,
  Dialog,
  FormField,
  Stack,
} from "@job-tracker/ui";
import React, { useMemo, useState } from "react";

import type { ApplicationSource } from "@/gql/hooks";
import {
  applicationSourceToComboLabel,
  getApplicationSourceComboOptions,
  parseApplicationSourceComboLabel,
} from "@/modules/applications/shared/utils/applicationSourceLabel";

import { FieldEditTriggerButton } from "./HoverEditableFieldRow";

const fieldId = "edit-application-source";

export function SourceEditDialog({
  value,
  onSave,
}: {
  value: ApplicationSource | null | undefined;
  onSave: (next: ApplicationSource | null) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() =>
    applicationSourceToComboLabel(value),
  );
  const [saving, setSaving] = useState(false);

  const options = useMemo(() => getApplicationSourceComboOptions(), []);

  const parsed = parseApplicationSourceComboLabel(draft);
  const isValid = parsed !== "invalid";
  const unchanged = isValid && (value ?? null) === parsed;
  const canSave = isValid && !unchanged && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const next = parseApplicationSourceComboLabel(draft);
      if (next === "invalid") return;
      await onSave(next);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(applicationSourceToComboLabel(value));
    }
  }

  return (
    <Dialog
      title="Edit source"
      description="Choose where this application came from."
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit source" />}
    >
      <Stack gap="sm">
        <FormField label="Source" htmlFor={fieldId}>
          <Combobox
            id={fieldId}
            value={draft}
            onValueChange={setDraft}
            options={options}
            placeholder="Search or pick a source"
            disabled={saving}
            state={!isValid && draft.trim() !== "" ? "error" : "default"}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
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
