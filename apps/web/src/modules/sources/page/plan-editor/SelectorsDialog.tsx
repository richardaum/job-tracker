"use client";

import { Button, cn, Dialog, FormField, Select, Textarea } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import { TemplateTextInput } from "@/modules/sources/page/plan-editor/TemplateTextInput";
import type { CollectJobsInput, Step } from "@/modules/sources/page/plan-editor/types";

type SelectorsDialogProps = {
  step: Step;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Step) => void;
};

export function SelectorsDialog({ step, open, onOpenChange, onSave }: SelectorsDialogProps) {
  const initial =
    step.action.kind === "collect.jobs"
      ? {
          containerSelector: step.action.input.containerSelector,
          itemSelector: step.action.input.itemSelector,
          detailsUrlField: step.action.input.detailsUrlField,
          key: step.action.input.key,
        }
      : { containerSelector: "", itemSelector: "", detailsUrlField: "", key: "" };
  const [draft, setDraft] = useState(initial);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const input = step.action.kind === "collect.jobs" ? step.action.input : null;
  const fieldOptions = [
    ...(input?.surfaceFields?.filter((f) => f.key).map((f) => ({ label: f.key, value: f.key })) ?? []),
    ...(input?.detailsFields?.filter((f) => f.key).map((f) => ({ label: f.key, value: f.key })) ?? []),
  ];

  function mergeIntoStep() {
    const action = step.action as { kind: "collect.jobs"; input: CollectJobsInput };
    return { ...step, action: { kind: "collect.jobs" as const, input: { ...action.input, ...draft } } };
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Selectors"
      description="Configure CSS selectors for job listing extraction."
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <FormField
            label="Container Selector"
            tooltip={<FieldTooltip content="CSS selector for the wrapper element containing all job listings." />}
            htmlFor="sel-container"
            required
          >
            <Textarea
              id="sel-container"
              value={draft.containerSelector}
              onChange={(e) => setDraft((prev) => ({ ...prev, containerSelector: e.target.value }))}
              placeholder="e.g. .job-list"
              rows={2}
              size="sm"
              className="font-mono text-xs"
            />
          </FormField>
          <FormField
            label="Item Selector"
            tooltip={<FieldTooltip content="CSS selector for each individual job listing row." />}
            htmlFor="sel-item"
            required
          >
            <Textarea
              id="sel-item"
              value={draft.itemSelector}
              onChange={(e) => setDraft((prev) => ({ ...prev, itemSelector: e.target.value }))}
              placeholder="e.g. .job-card"
              rows={2}
              size="sm"
              className="font-mono text-xs"
            />
          </FormField>
          <FormField
            label="Details URL Field"
            tooltip={<FieldTooltip content="Which field contains the URL to each detail page." />}
            htmlFor="sel-detailsUrl"
            required
          >
            <Select
              placeholder="Select a field..."
              options={fieldOptions}
              value={draft.detailsUrlField || undefined}
              onValueChange={(v) => setDraft((prev) => ({ ...prev, detailsUrlField: v }))}
            />
          </FormField>
          <FormField
            label="Key Template"
            tooltip={
              <FieldTooltip content="Template for unique job IDs. Use {{fieldName}} to reference collected fields." />
            }
            htmlFor="sel-key"
          >
            <TemplateTextInput
              value={draft.key ?? ""}
              onChange={(v) => setDraft((prev) => ({ ...prev, key: v }))}
              fields={fieldOptions}
              placeholder="e.g. {{company}}-{{title}}"
              onValidationError={setTemplateError}
            />
          </FormField>
        </div>
      </div>
      <Dialog.BottomActions className={cn("justify-end")}>
        <Button intent="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          intent="primary"
          disabled={templateError !== null}
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
