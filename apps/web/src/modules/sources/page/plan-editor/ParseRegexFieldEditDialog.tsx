"use client";

import { Button, Checkbox, cn, Dialog, FormField, Input } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type { ParseRegexField } from "@/modules/sources/page/plan-editor/types";

export function ParseRegexFieldEditDialog({
  field,
  open,
  onOpenChange,
  onSave,
}: {
  field: ParseRegexField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (field: ParseRegexField) => void;
}) {
  const [draft, setDraft] = useState<ParseRegexField>(
    field ?? { key: "", pattern: "", group: 1, required: false },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={field ? "Edit Regex Field" : "Add Regex Field"}
      description={field ? `Editing "${field.key}".` : "Define a new regex extraction field."}
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <FormField
            label="Key"
            tooltip={<FieldTooltip content="Identifier for the extracted value." />}
            htmlFor="prf-key"
            required
          >
            <Input
              id="prf-key"
              value={draft.key}
              onChange={(e) => setDraft((prev) => ({ ...prev, key: e.target.value }))}
              placeholder="e.g. salary"
            />
          </FormField>
          <FormField
            label="Pattern"
            tooltip={
              <FieldTooltip content="Regex with at least one capture group to extract the value." />
            }
            htmlFor="prf-pattern"
            required
          >
            <Input
              id="prf-pattern"
              value={draft.pattern}
              onChange={(e) => setDraft((prev) => ({ ...prev, pattern: e.target.value }))}
              placeholder="e.g. R\\$\\s?([\\d,.]+)"
              className={cn("font-mono")}
            />
          </FormField>
          <div className={cn("flex gap-4")}>
            <div className={cn("flex-1")}>
              <FormField
                label="Flags"
                tooltip={
                  <FieldTooltip content="Regex flags: i (case-insensitive), g (global), m (multiline)." />
                }
                htmlFor="prf-flags"
              >
                <Input
                  id="prf-flags"
                  value={draft.flags ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      flags: e.target.value || undefined,
                    }))
                  }
                  placeholder="e.g. i"
                  className={cn("font-mono")}
                />
              </FormField>
            </div>
            <div className={cn("flex-1")}>
              <FormField
                label="Group"
                tooltip={
                  <FieldTooltip content="Capture group index: 1 for first group, 0 for full match." />
                }
                htmlFor="prf-group"
              >
                <Input
                  id="prf-group"
                  type="number"
                  min={0}
                  max={9}
                  value={String(draft.group ?? 1)}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      group: Number(e.target.value),
                    }))
                  }
                />
              </FormField>
            </div>
            <div className={cn("flex items-end pb-1")}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md border border-border-default px-3 py-2.5 text-sm hover:bg-bg-surface-hover",
                )}
              >
                <Checkbox
                  checked={draft.required ?? false}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({
                      ...prev,
                      required: Boolean(checked),
                    }))
                  }
                />
                <span className={cn("text-text-secondary")}>Required</span>
                <FieldTooltip content="If checked, the step fails when this pattern doesn't match." />
              </label>
            </div>
          </div>
        </div>
      </div>
      <Dialog.BottomActions className={cn("justify-end")}>
        <Button intent="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          intent="primary"
          onClick={() => {
            onSave(draft);
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </Dialog.BottomActions>
    </Dialog>
  );
}
