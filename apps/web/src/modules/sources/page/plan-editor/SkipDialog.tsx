"use client";

import { Button, cn, Dialog, FormField, Input, Select } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type { CollectJobsInput, Skip, Step } from "@/modules/sources/page/plan-editor/types";

type SkipDialogProps = {
  step: Step;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Step) => void;
};

export function SkipDialog({ step, open, onOpenChange, onSave }: SkipDialogProps) {
  const initial = step.action.kind === "collect.jobs" ? step.action.input.skip : undefined;

  const [enabled, setEnabled] = useState(initial != null);
  const [value, setValue] = useState(initial?.value ?? "");
  const [sourceField, setSourceField] = useState(initial?.sourceField ?? "");
  const [flags, setFlags] = useState(initial?.flags ?? "");

  const availableKeys = step.action.kind === "collect.jobs" ? step.action.input.surfaceFields.map((f) => f.key) : [];

  function mergeIntoStep(): Step {
    const action = step.action as { kind: "collect.jobs"; input: CollectJobsInput };
    const skip: Skip | undefined =
      enabled && value
        ? { type: "regex", value, sourceField: sourceField || undefined, flags: flags || undefined }
        : undefined;
    return { ...step, action: { kind: "collect.jobs", input: { ...action.input, skip } } };
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Skip Filter"
      description="Skip items that match a regex pattern (e.g. non-job messages)."
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <FormField label="Enable skip filter" htmlFor="skip-enabled">
            <Select
              options={[
                { label: "Disabled", value: "false" },
                { label: "Enabled", value: "true" },
              ]}
              value={enabled ? "true" : "false"}
              onValueChange={(v) => setEnabled(v === "true")}
            />
          </FormField>

          {enabled && (
            <>
              <FormField
                label="Regex Pattern"
                tooltip={<FieldTooltip content="Items whose text matches this regex will be skipped." />}
                htmlFor="skip-value"
              >
                <Input
                  id="skip-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. ^(?!.*🚀).*$"
                />
              </FormField>

              <FormField
                label="Source Field"
                tooltip={
                  <FieldTooltip content="Optional: test against a specific field instead of all concatenated text." />
                }
                htmlFor="skip-source"
              >
                {availableKeys.length > 0 && (
                  <Select
                    options={availableKeys.map((k) => ({ label: k, value: k }))}
                    value={sourceField}
                    onValueChange={setSourceField}
                  />
                )}
                {availableKeys.length === 0 && (
                  <Input
                    id="skip-source"
                    value={sourceField}
                    onChange={(e) => setSourceField(e.target.value)}
                    placeholder="Field name"
                  />
                )}
              </FormField>

              <FormField
                label="Regex Flags"
                tooltip={<FieldTooltip content="Optional: e.g. 'i' for case-insensitive." />}
                htmlFor="skip-flags"
              >
                <Input id="skip-flags" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="e.g. i" />
              </FormField>
            </>
          )}
        </div>
      </div>
      <Dialog.BottomActions className={cn("justify-end")}>
        <Button intent="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          intent="primary"
          onClick={() => {
            onSave(mergeIntoStep());
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </Dialog.BottomActions>
    </Dialog>
  );
}
